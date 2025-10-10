# Project Migration & Enhancement TODO

## High Priority Tasks

### 1. Firebase Configuration & Setup

- [x] Add Firebase config to project
- [ ] Create `js/firebase-config.js` with correct configuration
- [ ] Enable Email/Password Authentication in Firebase Console
- [ ] Set up Firestore Database and Security Rules
- [ ] Remove Supabase/Bolt traces from HTML files
- [ ] Verify Firebase initialization in all pages
- [ ] Verify and Fix all syntax errors then Verify all again

### 2. Authentication Flow

- [-] Fix signup flow
  - [-] Ensure verification emails are sent
  - [x] Add proper error handling and toasts
    - [-] Fix signup page hanging issue
    - [x] Stabilized `js/firebase.js` adapter (compat-mode)
    - [ ] Add detailed error logging for signup failures
- [ ] Fix login flow
  - [ ] Ensure session persistence
  - [ ] Fix dashboard redirect loop
  - [ ] Display username correctly
- [ ] Update session management
  - [ ] Implement proper auth state listeners
  - [ ] Handle token refresh
  - [ ] Add session timeout handling

### 3. Database Migration (Files to Update)

- [ ] High-Priority Files (Most Supabase References)
  - [ ] js/admin.js (67 references)
  - [ ] js/admin-bottom-nav.js (39 references)
  - [ ] js/api.js (22 references)
  - [ ] js/dashboard.js (8 references)
- [ ] Remove Legacy Files
  - [ ] js/supabase.js
  - [ ] js/supabase-shim.js

### 4. Core Functionality

- [ ] User Profile Management
  - [ ] Store user profiles in Firestore
  - [ ] Display user name on dashboard
  - [ ] Fix time-based greetings
- [ ] Admin Features
  - [ ] Complete admin view of all users
  - [ ] Transaction processing
  - [ ] Withdrawal approval system
- [ ] Real-time Updates
  - [ ] Implement Firestore listeners
  - [ ] Update balance display
  - [ ] Live notifications

## Testing & Verification

### 1. Authentication Tests

- [ ] Test signup with email verification
- [ ] Test login persistence
- [ ] Test admin access control
- [ ] Verify session management

### 2. Core Features Tests

- [ ] Test user profile display
- [ ] save user profile picture to device(local storage for now)
- [ ] Test admin transaction view
- [ ] Test withdrawal processing
- [ ] Test real-time updates

### 3. Error Handling

- [ ] Verify all error messages
- [ ] Test network error recovery
- [ ] Validate form validation
- [ ] Check toast notifications

## Remaining Supabase References to Remove

1. js/admin.js (67 references)
2. js/admin-bottom-nav.js (39 references)
3. js/supabase.js (31 references)
4. js/api.js (22 references)
5. js/dashboard.js (8 references)
6. js/supabase-shim.js (6 references)
7. js/profile.js (3 references)

## Current Issues

1. Signup page hangs after user creation (spinner/disabled button) — in-progress
2. Verification emails not consistently sent (likely Firebase Console config / unauthorized domain / quota) — investigation in-progress
3. Login redirects back to login page (authManager enforces emailVerified) — expected until email verified
4. Username not displaying on dashboard — depends on profile write & session checks
5. Multiple Supabase dependencies causing conflicts — planned removal

## Recent Actions

- Stabilized `js/firebase.js`: replaced corrupted/duplicated file with a single compat-mode adapter and verified no syntax errors.
- Added a todo to add detailed signup error logging and to run smoke tests once you confirm Firebase Console Email/Password provider and authorized domains.

## Next Steps (short-term)

1. Add more detailed logging to `js/firebase.js` signUp to surface HTTP error codes and messages from the Firebase REST/SDK (so UI can show the exact cause).
2. Run signup/login smoke tests in browser after you confirm Email/Password is enabled and authorized domains include your testing host.
3. If emails still don't send: inspect browser console logs (we will log error.code and error.message) and adjust code or instruct on Firebase Console settings.

## Notes

- Prioritize authentication and core user experience
- Keep changes atomic and testable
- Document all Firebase-specific configurations
- Test each component after migration
