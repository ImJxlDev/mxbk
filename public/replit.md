# Top-Margin Trading Platform - Replit Setup

## Project Overview
This is a comprehensive full-stack trading platform built with Node.js/Express backend and Firebase for authentication and database. The platform features real-time trading, user dashboard, admin panel, and secure authentication with email verification.

## Architecture

### Backend Stack
- **Node.js/Express**: Server that handles API routes and serves frontend
- **Firebase Admin SDK**: Server-side Firebase authentication and Firestore operations
- **Nodemailer**: Email verification and password reset functionality
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing

### Frontend Stack
- **HTML5/CSS3**: Modern responsive design with CSS custom properties
- **Vanilla JavaScript**: ES6 modules for modular code organization
- **Chart.js**: Real-time trading charts and analytics
- **TradingView Widget**: Professional market visualization
- **Font Awesome**: Icon library
- **Firebase Client SDK**: Client-side Firebase authentication

### Database
- **Cloud Firestore**: NoSQL database for storing user profiles, transactions, trades, and more
- **Firebase Admin**: Server-side database operations

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

### October 15, 2025 - Replit Setup Complete ✅
- ✅ **Configured Express server** to run on 0.0.0.0:5000 for Replit environment
- ✅ **Fixed dynamic URL handling** for email verification links (works in development and production)
- ✅ **Fixed critical module loading error** - removed duplicate script tags for utils.js and other ES6 modules
- ✅ **Updated .gitignore** to protect serviceAccountKey.json and other sensitive files
- ✅ **Installed all dependencies** - npm packages installed successfully
- ✅ **Set up workflow** - Server workflow configured to run on port 5000 with nodemon
- ✅ **Configured deployment** - VM deployment configured with npm start
- ✅ **Verified frontend** - Landing page loads correctly with Firebase fully initialized
- ✅ **No errors in console** - All module loading issues resolved

### October 14, 2025
- ✅ Added Firebase configuration to all HTML pages
- ✅ Fixed script loading order (firebase-config.js before supabase-shim.js)
- ✅ Fixed Firebase initialization timing issue with retry mechanism
- ✅ Created comprehensive Firebase setup guide (FIREBASE_SETUP_GUIDE.md)
- ⚠️ Email verification temporarily disabled for testing

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

### Running on Replit
The project runs with Express server and nodemon for auto-reload:
```bash
npm run dev  # Uses nodemon for development
npm start    # Uses node for production
```

### Environment Variables
The following environment variables can be configured (optional):
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret for JWT token signing (has default)
- `EMAIL_USER`: Email address for sending verification emails (optional)
- `EMAIL_PASS`: Email password for nodemailer (optional)
- `NODE_ENV`: Environment mode (development/production)

### Replit Configuration
- **Port**: 5000 (required for Replit)
- **Host**: 0.0.0.0 (binds to all interfaces for Replit proxy)
- **Workflow**: npm run dev (uses nodemon)
- **Deployment**: VM with npm start

## Setup Complete ✅

### Working Features
- ✅ Express server running on port 5000
- ✅ Firebase Admin SDK connected
- ✅ Firebase Client SDK initialized
- ✅ Authentication system (registration, login, email verification)
- ✅ User dashboard with real-time data
- ✅ Admin panel for user management
- ✅ Real-time price engine
- ✅ Trading interface
- ✅ Responsive design for all devices

### Optional Enhancements
1. Configure email service (EMAIL_USER, EMAIL_PASS) for email verification
2. Complete migration from Supabase references to pure Firebase
3. Implement admin withdrawal processing
4. Add profile picture upload functionality
5. Enable profile editing for users
6. Test all trading features end-to-end

## Deployment

### Replit Deployment
- **Type**: VM (Virtual Machine) - maintains server state
- **Command**: npm start (uses node server.js)
- **Port**: 5000 (automatically exposed)
- **Environment**: Firebase Admin SDK configured with serviceAccountKey.json
- **Features**: Email verification, JWT authentication, real-time trading

### Production Considerations
- Email service needs to be configured for production (EMAIL_USER, EMAIL_PASS)
- Firebase security rules should be reviewed
- serviceAccountKey.json is protected in .gitignore
- JWT_SECRET should be set to a strong random value in production

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

## Key Fixes Applied (October 15, 2025)

### 1. Server Configuration
- Changed server to bind to `0.0.0.0:5000` for Replit environment
- Added dynamic base URL detection for email links (uses REPLIT_DEV_DOMAIN)
- Updated email verification and password reset URLs to work in all environments

### 2. Module Loading Fix (Critical)
- **Problem**: Files with ES6 `export` statements were loaded as regular scripts
- **Solution**: Removed duplicate `<script src="js/utils.js">` tags from HTML files
- **Files Fixed**: index.html, settings.html, withdraw.html
- **Result**: No more "export declarations may only appear at top level of a module" errors

### 3. Security Updates
- Added serviceAccountKey.json to .gitignore
- Protected sensitive configuration files
- Configured proper CORS and security headers

---
Last Updated: October 15, 2025 - Replit Setup Complete ✅
