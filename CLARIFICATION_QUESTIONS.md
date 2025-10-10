# Clarification questions for Firebase migration and feature decisions

Please answer these so I can migrate the project from Supabase to Firebase and complete the requested features.

1. Firebase project

- Is the Firebase project whose config is in `js/firebase-config.js` the one to use, or will you provide different credentials? no

2. Authentication and verification

- Should sign-up require email verification before the user can access the dashboard? (Current code sends verification email.) yes
- For resend verification, do you want an in-app flow (user signs in then requests verification) or admin-initiated resends? user signs in then requests verification

3. User profile shape

- Confirm profile fields you require in Firestore `profiles` collection (suggested minimal shape):
  - id (uid), email, full_name, role (user|admin), status, balances (object), created_at, updated_at, settings (object)
- Any additional fields required (phone, kyc_status, referrer, country)? yes after signup then help make the profile page work accross app

4. Collections and indexes

- Confirm collections to create: `profiles`, `transactions`, `trades`, `withdrawals`, `notifications`, `admin_logs`, `prices`, `broadcasts`.
- Do you want server-side timestamps (Firestore `serverTimestamp()`) or client ISO strings? server-side timestamps

5. Admin permissions and workflows

- Admin role name to check (default: `admin`)
- Admin should be able to view all users, trades, transactions, and process withdrawals. Confirm approval/rejection flow and whether actions should be logged in `admin_logs`.
- Should admin be able to transfer funds from an admin wallet to a user and adjust balances? If so, what fields should the admin wallet track? yes

6. Withdrawals and transfers

- Confirm withdrawal lifecycle statuses (suggested: pending, approved, rejected, paid).
- When admin approves a withdrawal, should the system perform balance deductions automatically or just mark the request approved for manual payout? mark the request approved for manual payout for now

7. Email notifications

- Do you want email notifications for: signup verification, withdrawal status changes, password resets, and admin broadcasts? If so, which provider will you use (Firebase has no built-in SMTP; use SendGrid, Mailgun, or Firebase Cloud Functions)? let admin send notification in app for now

8. Data migration

- Is there existing user data in Supabase that must be migrated automatically? If yes, provide a dump/export or allow me to add a migration script that reads Supabase and writes to Firestore (requires Supabase credentials). no i want to start fresh

9. Time & greeting

- How should the greeting map to hours? (Default: 00-11: morning, 12-17: afternoon, 18-23: evening) yes
- Do you want localized time/date display based on user timezone stored in profile, or browser locale? the ui does not have time date only greetings

10. Admin email for alerts

- Which admin email(s) should receive system alerts (for failed jobs, payments, or suspicious activity)? i will add this later but let me recoeve them from firebase for now

11. Removal of Supabase

- Do you want all Supabase code left in place as a fallback, or fully removed from the repository? as fall back but pls map their location i i can remofe later

12. External integrations

- Any third-party integrations (payment processors, KYC providers, custody wallets) that need credentials or special handling? maybe but keep in mind i may manually add wallet address and qr code

13. Testing and deployment

- Where will the app be hosted (static site hosting like Netlify/Vercel or your own server)? Netlify for now
- Do you want me to add a small test harness to verify sign-up/login/profile CRUD with Firestore? yes

14. Admin features priority

- Rank these admin features by priority (1-highest): viewing users, processing withdrawals, broadcasting messages, editing user balances, exporting logs, viewing trades. yes

15. Additional UI changes

- Should the dashboard show the user's full name everywhere or only first name in greetings? first name
- Any design adjustments for admin pages or mobile behavior? no major chanfe keep current design

16. Security rules

- Any special security constraints for Firestore rules (e.g., only admin can read all `transactions`, users can read only their own)? yes

17. Mail verification experience

- Current flow uses email verification links. Should the verify page (`verify.html`) display instructions and direct sign-in after v
erification, or should email be required before access? 


18. Admin wallet implementation

- Define whether admin wallet is a virtual balance in `profiles` (e.g., profile.role==='admin' and balances.admin) or a dedicated collection `admin_wallet`. i do not understand this but i think admin should input his balance for now but set up an explanation fot this

19. Logging and audit

- What level of audit logging is required for financial actions? (e.g., record user, admin, action, before/after balances, timestamp, IP) yes

20. Anything else?

- Any other requirements or constraints I should know before proceeding?
  the tabs in the page is not functional on the bonus page
  and pls create the profile to allow users edit their info
  and check for every other features not working and syntax errs

Please add answers below; once provided I'll continue with the migration changes and implement the Firebase-backed flows. ok
