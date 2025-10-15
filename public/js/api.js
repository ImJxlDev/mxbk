// API client implemented on top of Firestore (compat). Keeps the same method names
// and return shapes as the previous Supabase implementation.
import { firebaseReady, getFirebaseClient } from "./firebase.js";

class ApiClient {
  constructor() {}

  async _getDb() {
    const fb = await firebaseReady;
    if (!fb || !fb.db) {
      return { db: null, firebase: fb ? fb.firebase : null };
    }
    return { db: fb.db, firebase: fb.firebase };
  }

  // Users
  async getUsers() {
    try {
      const { db } = await this._getDb();
      if (!db) return { data: [], error: new Error("Firestore not available") };
      const snap = await db
        .collection("users")
        .orderBy("created_at", "desc")
        .get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { data, error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  }

  async getUserById(id) {
    try {
      const { db } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const doc = await db.collection("users").doc(id).get();
      if (!doc.exists) return { data: null, error: null };
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async updateUser(id, updates) {
    try {
      const { db } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      await db.collection("users").doc(id).update(updates);
      const doc = await db.collection("users").doc(id).get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async deleteUser(id) {
    try {
      const { db } = await this._getDb();
      if (!db) return { error: new Error("Firestore not available") };
      await db.collection("users").doc(id).delete();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }

  // Transactions
  async getTransactions(userId = null) {
    try {
      const { db } = await this._getDb();
      if (!db) return { data: [], error: new Error("Firestore not available") };
      let q = db.collection("transactions").orderBy("created_at", "desc");
      if (userId) q = q.where("user_id", "==", userId);
      const snap = await q.get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { data, error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  }

  async createTransaction(transaction) {
    try {
      const { db, firebase } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const toWrite = { ...transaction };
      if (!toWrite.created_at)
        toWrite.created_at =
          firebase && firebase.firestore && firebase.firestore.FieldValue
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString();
      const ref = await db.collection("transactions").add(toWrite);
      const doc = await ref.get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Trades
  async getTrades(userId = null) {
    try {
      const { db } = await this._getDb();
      if (!db) return { data: [], error: new Error("Firestore not available") };
      let q = db.collection("trades").orderBy("opened_at", "desc");
      if (userId) q = q.where("user_id", "==", userId);
      const snap = await q.get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { data, error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  }

  async createTrade(trade) {
    try {
      const { db, firebase } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const toWrite = { ...trade };
      if (!toWrite.opened_at)
        toWrite.opened_at =
          firebase && firebase.firestore && firebase.firestore.FieldValue
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString();
      const ref = await db.collection("trades").add(toWrite);
      const doc = await ref.get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async updateTrade(id, updates) {
    try {
      const { db } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      await db.collection("trades").doc(id).update(updates);
      const doc = await db.collection("trades").doc(id).get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async deleteTrade(id) {
    try {
      const { db } = await this._getDb();
      if (!db) return { error: new Error("Firestore not available") };
      await db.collection("trades").doc(id).delete();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }

  // Withdrawals
  async getWithdrawals(userId = null) {
    try {
      const { db } = await this._getDb();
      if (!db) return { data: [], error: new Error("Firestore not available") };
      let q = db.collection("withdrawals").orderBy("created_at", "desc");
      if (userId) q = q.where("user_id", "==", userId);
      const snap = await q.get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { data, error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  }

  async createWithdrawal(withdrawal) {
    try {
      const { db, firebase } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const toWrite = { ...withdrawal };
      if (!toWrite.created_at)
        toWrite.created_at =
          firebase && firebase.firestore && firebase.firestore.FieldValue
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString();
      const ref = await db.collection("withdrawals").add(toWrite);
      const doc = await ref.get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async updateWithdrawal(id, updates) {
    try {
      const { db } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      await db.collection("withdrawals").doc(id).update(updates);
      const doc = await db.collection("withdrawals").doc(id).get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Notifications
  async getNotifications(userId = null) {
    try {
      const { db } = await this._getDb();
      if (!db) return { data: [], error: new Error("Firestore not available") };
      let q = db.collection("notifications").orderBy("created_at", "desc");
      if (userId) q = q.where("user_id", "==", userId);
      const snap = await q.get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { data, error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  }

  async createNotification(notification) {
    try {
      const { db, firebase } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const toWrite = { ...notification };
      if (!toWrite.created_at)
        toWrite.created_at =
          firebase && firebase.firestore && firebase.firestore.FieldValue
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString();
      const ref = await db.collection("notifications").add(toWrite);
      const doc = await ref.get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async markNotificationRead(id) {
    try {
      const { db } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      await db.collection("notifications").doc(id).update({ read: true });
      const doc = await db.collection("notifications").doc(id).get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async markAllNotificationsRead(userId) {
    try {
      const { db } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const snap = await db
        .collection("notifications")
        .where("user_id", "==", userId)
        .get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // Real-time price data
  async getPrices() {
    try {
      const { db } = await this._getDb();
      if (!db) return { data: [], error: new Error("Firestore not available") };
      const snap = await db
        .collection("prices")
        .orderBy("updated_at", "desc")
        .get();
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { data, error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  }

  async updatePrice(symbol, priceData) {
    try {
      const { db, firebase } = await this._getDb();
      if (!db)
        return { data: null, error: new Error("Firestore not available") };
      const docRef = db.collection("prices").doc(symbol);
      const payload = {
        symbol,
        price: priceData.price,
        change_24h: priceData.change,
        change_percent_24h: priceData.changePercent,
        volume_24h: priceData.volume,
        updated_at:
          firebase && firebase.firestore && firebase.firestore.FieldValue
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString(),
      };
      await docRef.set(payload, { merge: true });
      const doc = await docRef.get();
      return { data: { id: doc.id, ...doc.data() }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

export const apiClient = new ApiClient();
