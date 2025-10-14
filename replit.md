# Top-Margin Trading Platform - Replit Setup

## Project Overview
This is a comprehensive trading platform built with Firebase for authentication and database. The platform features real-time trading, user dashboard, admin panel, and secure authentication.

## Architecture

### Frontend Stack
- **HTML5/CSS3**: Modern responsive design with CSS custom properties
- **Vanilla JavaScript**: ES6 modules for modular code organization
- **Chart.js**: Real-time trading charts and analytics
- **TradingView Widget**: Professional market visualization
- **Font Awesome**: Icon library

### Backend/Database
- **Firebase Authentication**: Email/password authentication with email verification
- **Cloud Firestore**: NoSQL database for storing user profiles, transactions, trades, and more
- **Firebase Analytics**: User analytics and tracking

### Project Structure
```
/
├── index.html                 # Landing page
├── login.html                 # User login
├── signup.html                # User registration  
├── dashboard.html             # User dashboard
├── admin*.html                # Admin panel pages
├── css/                       # Stylesheets
│   ├── base.css              # Global styles
│   ├── landing.css           # Landing page styles
│   ├── dashboard.css         # Dashboard styles
│   └── admin.css             # Admin styles
├── js/                        # JavaScript modules
│   ├── firebase-config.js    # Firebase configuration
│   ├── firebase.js           # Firebase adapter
│   ├── auth.js               # Authentication manager
│   ├── api.js                # API client (Firestore)
│   ├── dashboard.js          # Dashboard logic
│   ├── admin.js              # Admin panel logic
│   └── utils.js              # Utility functions
└── img/                       # Images and assets
```

## Current Setup

### Firebase Configuration
- **Project ID**: maxprofit-ca096
- **Authentication**: Email/Password enabled
- **Database**: Cloud Firestore
- **Collections**: profiles, transactions, trades, withdrawals, notifications, admin_logs, prices

### User Profile Schema (Firestore)
```javascript
{
  id: string,              // Firebase UID
  email: string,
  full_name: string,
  role: "user" | "admin",
  status: "active",
  balances: {
    USD: number,
    BTC: number,
    ETH: number
  },
  created_at: string,      // ISO timestamp
  updated_at: string
}
```

### Authentication Flow
1. User signs up with email/password
2. Firebase creates user account and sends verification email
3. User verifies email via link
4. User can log in after verification
5. Profile is created in Firestore with default balances

## Features

### User Dashboard
- ✅ Time-based greeting (Good morning/afternoon/evening)
- ✅ User profile display with first name
- ✅ Portfolio balance tracking
- ✅ Real-time trading interface
- ✅ Transaction history
- ✅ Notifications system
- ✅ Responsive mobile design

### Admin Panel
- User management (view all users)
- Transaction processing
- Withdrawal approval system
- Trading oversight
- Broadcast notifications
- Activity logs

### Security
- Email verification required
- Firebase security rules
- Role-based access control (user/admin)
- Session management with auto-logout on token expiration

## Recent Changes (October 2025)

### October 14, 2025 (Latest)
- ✅ **DISABLED email verification temporarily** for testing (can be re-enabled later)
- ✅ Fixed Firebase initialization timing issue with retry mechanism
- ✅ Created comprehensive Firebase setup guide (FIREBASE_SETUP_GUIDE.md)
- ⚠️ **Action Required**: Configure email authentication in Firebase Console
- ⚠️ **Security Note**: Email verification is OFF - only for testing!

### October 14, 2025 (Earlier)
- ✅ Added Firebase configuration to all HTML pages
- ✅ Fixed script loading order (firebase-config.js before supabase-shim.js)
- ✅ Set up static web server on port 5000
- ✅ Verified authentication flow and Firebase integration
- ✅ Confirmed user profile display and time-based greetings are working

## Firebase Console Setup Required

### 1. Authentication
- Enable Email/Password authentication
- Add authorized domains for deployment

### 2. Firestore Database
- Create database in production or test mode
- Set up security rules (see below)

### 3. Security Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /trades/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    // Add more rules for other collections
  }
}
```

## Development

### Running Locally
The project uses Python's http.server for static file serving:
```bash
python -m http.server 5000
```

### Environment
- Port: 5000 (required for Replit)
- Host: 0.0.0.0 (binds to all interfaces)

## Known Issues & TODO

### Current Status
- ✅ Firebase integration working
- ✅ Authentication flow implemented
- ✅ User profile display working
- ✅ Time-based greetings implemented
- ⏳ Supabase compatibility layer (supabase-shim.js) provides backward compatibility

### Remaining Tasks (from TODO.md)
1. Complete migration from Supabase references to pure Firebase
2. Implement admin withdrawal processing
3. Add profile picture upload functionality
4. Fix bonus page tabs functionality
5. Enable profile editing for users
6. Test all features end-to-end

## Deployment

### Production Deployment
- Platform: Netlify (planned)
- Build: Static site (no build step required)
- Environment: Production Firebase project

### Deployment Configuration
Will be configured using Replit's deployment tool once all features are tested.

## User Preferences

### Coding Style
- Clean, readable code with comments
- Modular ES6+ JavaScript
- Responsive CSS with mobile-first approach
- Firebase compat SDK for better browser compatibility

### Workflow
- Test each feature thoroughly before marking complete
- Document all changes in replit.md
- Keep TODO.md updated with progress
- Maintain backward compatibility during migration

## Important Notes

### Migration Status
This project is in transition from Supabase to Firebase:
- **Firebase**: Primary backend (active)
- **Supabase shim**: Compatibility layer for legacy code
- Legacy Supabase code locations documented in TODO.md for future cleanup

### Testing Checklist
- [ ] Signup with email verification
- [ ] Login and session persistence
- [ ] Profile display with correct name and greeting
- [ ] Trading functionality
- [ ] Deposit/withdrawal flows
- [ ] Admin access and features
- [ ] Real-time notifications
- [ ] Mobile responsiveness

## Support & Maintenance

### Firebase Resources
- Console: https://console.firebase.google.com
- Project: maxprofit-ca096
- Documentation: https://firebase.google.com/docs

### Key Files to Monitor
- js/firebase-config.js - Firebase credentials
- js/auth.js - Authentication logic
- js/dashboard.js - User interface logic
- js/admin.js - Admin panel logic

---
Last Updated: October 14, 2025
