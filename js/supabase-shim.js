// Supabase shim: provides a minimal supabase-like API implemented on top of Firebase Firestore
// This shim allows older code written for supabase-js to work with Firestore without full rewrite.
// NOTE: This is a pragmatic shim covering common CRUD patterns used in the admin scripts.

(function (window) {
  if (window.supabase) return; // don't overwrite

  // Wait for Firebase to be ready (retry mechanism)
  function initShim() {
    const firebase = window.firebase;
    if (!firebase) {
      // Retry after a short delay if Firebase is still loading
      if (!window._supabaseShimRetryCount) window._supabaseShimRetryCount = 0;
      if (window._supabaseShimRetryCount < 30) { // Max 3 seconds (30 * 100ms)
        window._supabaseShimRetryCount++;
        setTimeout(initShim, 100);
        return;
      }
      console.error(
        "Supabase shim requires Firebase to be loaded first (window.firebase)"
      );
      window.supabase = null;
      return;
    }

  const db = firebase.firestore();
  const listeners = new Map();

  function from(table) {
    const qb = {
      _table: table,
      _wheres: [],
      _order: null,
      _limit: null,
      select(selectStr) {
        this._select = selectStr;
        return this;
      },
      order(field, opts) {
        this._order = { field, opts };
        return this;
      },
      limit(n) {
        this._limit = n;
        return this;
      },
      eq(field, val) {
        this._wheres.push({ op: "==", field, val });
        return this;
      },
      gte(field, val) {
        this._wheres.push({ op: ">=", field, val });
        return this;
      },
      async insert(rows) {
        try {
          const arr = Array.isArray(rows) ? rows : [rows];
          const results = [];
          for (const row of arr) {
            if (row.id) {
              await db.collection(table).doc(row.id).set(row);
              results.push({ id: row.id, ...row });
            } else {
              const ref = await db.collection(table).add(row);
              results.push({ id: ref.id, ...row });
            }
          }
          return { data: results, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async update(updates) {
        try {
          // find id clause
          const idWhere = this._wheres.find(
            (w) => w.field === "id" && w.op === "=="
          );
          if (!idWhere) throw new Error('update requires .eq("id", value)');
          const id = idWhere.val;
          const docRef = db.collection(table).doc(id);
          // handle special arithmetic-like objects
          const current = (await docRef.get()).data() || {};
          const final = { ...updates };
          // support supabase.sql-like objects: { __sql: true, expr: 'balance +', value: X }
          for (const k of Object.keys(final)) {
            const v = final[k];
            if (v && v.__sql && typeof v.value === "number") {
              const old = Number(current[k] || 0);
              final[k] = old + v.value;
            }
          }
          final.updated_at = new Date().toISOString();
          await docRef.update(final);
          const doc = await docRef.get();
          return { data: doc.data(), error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async delete() {
        try {
          const idWhere = this._wheres.find(
            (w) => w.field === "id" && w.op === "=="
          );
          if (!idWhere) throw new Error('delete requires .eq("id", value)');
          const id = idWhere.val;
          await db.collection(table).doc(id).delete();
          return { data: null, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async select() {
        try {
          let q = db.collection(table);
          for (const w of this._wheres) {
            q = q.where(w.field, w.op, w.val);
          }
          if (this._order)
            q = q.orderBy(
              this._order.field,
              this._order.opts && this._order.opts.ascending ? "asc" : "desc"
            );
          if (this._limit) q = q.limit(this._limit);
          const snap = await q.get();
          const data = [];
          for (const doc of snap.docs) {
            data.push({ id: doc.id, ...doc.data() });
          }

          // Handle simple join hint: if select contains 'profiles:' try to attach profile doc
          if (this._select && this._select.includes("profiles:profiles")) {
            // attach profiles by user_id or profile_id if present
            await Promise.all(
              data.map(async (row, idx) => {
                const uid =
                  row.user_id || row.user || row.profile_id || row.userId;
                if (uid) {
                  const p = await db.collection("profiles").doc(uid).get();
                  data[idx].profiles = p.exists ? p.data() : null;
                }
              })
            );
          }

          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async single() {
        const res = await this.select();
        if (res.error) return res;
        return { data: res.data[0] || null, error: null };
      },
    };
    return qb;
  }

  // simple channel shim - maps to Firestore snapshots where possible
  function channel(name) {
    return {
      _table: null,
      on(event, opts, cb) {
        // opts may include table
        if (opts && opts.table) this._table = opts.table;
        this._cb = cb;
        return this;
      },
      subscribe() {
        if (!this._table) return this;
        const col = db.collection(this._table);
        const unsub = col.onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const payload = {
              eventType: change.type.toUpperCase(),
              new: change.doc.data(),
              old: null,
            };
            if (this._cb) this._cb(payload);
          });
        });
        listeners.set(this._table, unsub);
        return this;
      },
    };
  }

  function removeChannel(listener) {
    if (!listener) return;
    const unsub = listeners.get(listener._table);
    if (unsub) unsub();
    listeners.delete(listener._table);
  }

  window.supabase = {
    auth: {
      async getUser() {
        const user = firebase.auth().currentUser;
        return { data: { user } };
      },
      async signOut() {
        try {
          await firebase.auth().signOut();
          return { error: null };
        } catch (e) {
          return { error: e };
        }
      },
    },
    from,
    channel,
    removeChannel,
    sql(strings, ...values) {
      // tiny helper used by admin.js for arithmetic emulation
      return { __sql: true, expr: strings.join("${}"), value: values[0] };
    },
  };
  } // Close initShim function
  
  // Start the initialization
  initShim();
})(window);
