# Top-Margin Trading - Backend Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- Firebase Project
- Gmail account (for sending emails)

## 🚀 Quick Start

### Step 1: Project Structure

Create this folder structure:

```
top-margin-trading/
├── server.js                 # Backend server
├── package.json             
├── .env                      # Environment variables
├── serviceAccountKey.json    # Firebase Admin SDK key
└── public/                   # Frontend files
    ├── index.html
    ├── signup.html
    ├── login.html
    ├── dashboard.html
    ├── js/
    │   ├── auth-client.js    # NEW - replaces auth.js
    │   └── ... (other JS files)
    └── css/
        └── ... (CSS files)
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Save the downloaded file as `serviceAccountKey.json` in your project root

### Step 4: Configure Email (Gmail)

1. **Enable 2-Factor Authentication:**
   - Go to [Google Account](https://myaccount.google.com/)
   - Security → 2-Step Verification → Turn on

2. **Generate App Password:**
   - Still in Security settings
   - Search for "App passwords"
   - Select app: "Mail"
   - Select device: "Other" (name it "Top-Margin")
   - Copy the 16-character password

3. **Update .env file:**

```bash
PORT=3000
JWT_SECRET=your-random-secret-key-here-make-it-long-and-secure
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=the-16-character-app-password
```

### Step 5: Update Frontend Files

**Replace these imports in your HTML files:**

❌ **OLD** (remove this):
```html
<script type="module">
  import { authManager } from './js/auth.js';
  import { getFirebaseClient } from './js/firebase.js';
  // ...
</script>
```

✅ **NEW** (use this):
```html
<script type="module">
  import { authManager } from './js/auth-client.js';
  // No firebase imports needed!
</script>
```

**Files to update:**
- `signup.html` - Change import from `auth.js` to `auth-client.js`
- `login.html` - Change import from `auth.js` to `auth-client.js`
- `dashboard.html` - Change import from `auth.js` to `auth-client.js`

### Step 6: Move Files to Public Folder

Move all your frontend files into the `public/` folder:

```bash
mkdir public
mv index.html signup.html login.html dashboard.html verify.html public/
mv css/ js/ img/ public/
```

**Important:** Copy `auth-client.js` to `public/js/` and delete the old `auth.js` and `firebase.js` files.

### Step 7: Update Dashboard Guard

In `public/dashboard.html`, find the auth guard script and update it:

```html
<!-- Dashboard Auth Guard - SIMPLIFIED -->
<script type="module">
  import { authManager } from './js/auth-client.js';

  async function checkAuth() {
    try {
      console.log('🔐 Dashboard: Checking authentication...');

      // Wait for authManager to initialize
      let attempts = 0;
      while (!authManager.ready && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (!authManager.ready) {
        throw new Error('AuthManager timeout');
      }

      // Check if authenticated
      const isAuth = authManager.isAuthenticated();
      
      if (!isAuth) {
        const hasSession = await authManager.checkSession();
        if (!hasSession) {
          console.log('❌ No authentication - redirecting');
          window.location.replace('/login');
          return false;
        }
      }

      const user = authManager.getUser();
      console.log('✅ User authenticated:', user?.email);

      // Make globally available
      window.authManager = authManager;
      window.dashboardAuthorized = true;
      
      return true;
    } catch (err) {
      console.error('❌ Dashboard auth error:', err);
      window.location.replace('/login');
      return false;
    }
  }

  checkAuth();
</script>
```

### Step 8: Update Signup Page

In `public/signup.html`, update the form submission:

```javascript
// Remove all Firebase imports
import { authManager } from './js/auth-client.js';
import { showToast, showLoading } from './js/utils.js';

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    showLoading(true);
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    const email = inputs.email.value.trim().toLowerCase();
    const password = inputs.password.value;
    const fullName = inputs.fullName.value.trim();

    const result = await authManager.register(email, password, fullName);

    if (result.success) {
      showToast('Account created! Please check your email to verify.', 'success');
      setTimeout(() => {
        window.location.href = `/verify.html?email=${encodeURIComponent(email)}`;
      }, 2000);
    } else {
      showToast(result.error || 'Failed to create account', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast('An error occurred during signup', 'error');
  } finally {
    showLoading(false);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Create Account';
  }
});
```

### Step 9: Update Login Page

In `public/login.html`, update the form submission:

```javascript
import { authManager } from './js/auth-client.js';
import { showToast, showLoading } from './js/utils.js';

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    showLoading(true);
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const result = await authManager.login(email, password);

    if (result.success) {
      showToast('Login successful! Redirecting...', 'success');

      setTimeout(() => {
        const profile = authManager.getProfile();
        if (profile?.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1000);
    } else {
      showToast(result.error, 'error');
      
      // Show resend verification if needed
      if (window.UNVERIFIED_EMAIL) {
        const resendArea = document.getElementById('resend-verification');
        const resendMsg = document.getElementById('resend-message');
        resendMsg.textContent = `Email ${window.UNVERIFIED_EMAIL} is not verified.`;
        resendArea.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed', 'error');
  } finally {
    showLoading(false);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
});
```

### Step 10: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Step 11: Test the Application

1. **Open browser:** http://localhost:3000
2. **Sign up:** Create a new account
3. **Check email:** Look for verification email
4. **Click verification link:** Verify your email
5. **Log in:** Use your credentials
6. **Access dashboard:** Should work without issues!

---

## 🔧 Troubleshooting

### Email not sending

**Problem:** Emails not being received

**Solutions:**
1. Check Gmail App Password is correct
2. Make sure 2FA is enabled on Google account
3. Check spam folder
4. Verify EMAIL_USER and EMAIL_PASS in .env
5. Check server logs for errors

```bash
# Test email configuration
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email config error:', error);
  } else {
    console.log('✅ Email server is ready');
  }
});
"
```

### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=3001
```

### Firebase Admin errors

**Problem:** Firebase Admin SDK not working

**Solutions:**
1. Verify `serviceAccountKey.json` is in project root
2. Check file permissions
3. Make sure JSON file is valid
4. Verify Firebase project ID matches

### CORS errors

**Problem:** CORS errors in browser console

**Solution:** The server already includes CORS middleware. If still having issues:

```javascript
// In server.js, update CORS config:
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

---

## 🎯 Key Benefits of This Approach

### ✅ **Working Email Verification**
- Real email sending with Nodemailer
- Clickable verification links
- Token expiration (24 hours)

### ✅ **No Firebase Auth Issues**
- Firebase only stores data
- Backend handles all authentication
- No race conditions or session issues

### ✅ **Better Security**
- JWT tokens with expiration
- Bcrypt password hashing
- Server-side validation

### ✅ **Full Control**
- Custom email templates
- Password reset flow
- Admin functionality easy to add

### ✅ **Scalable**
- Easy to add features
- Can switch to Redis for tokens
- Can add rate limiting
- Can add more auth methods (OAuth, etc.)

---

## 📝 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| GET | `/api/auth/verify-email?token=` | Verify email | No |
| POST | `/api/auth/resend-verification` | Resend verification | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

### Request Examples

**Register:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  },
  "profile": { ... }
}
```

**Authenticated Request:**
```
GET /api/auth/me
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Security Notes

1. **Change JWT_SECRET** - Use a long, random string
2. **Use HTTPS in production** - Never send tokens over HTTP
3. **Environment variables** - Never commit .env to git
4. **Rate limiting** - Add rate limiting in production
5. **Token expiration** - JWT tokens expire in 7 days
6. **Password requirements** - Minimum 8 characters enforced

---

## 🚀 Next Steps

1. **Add more features:**
   - Social login (Google, Facebook)
   - 2FA authentication
   - Session management
   - Account deletion

2. **Improve security:**
   - Rate limiting with express-rate-limit
   - Redis for token blacklisting
   - Helmet.js for security headers
   - Input sanitization

3. **Add monitoring:**
   - Error logging (Winston, Sentry)
   - Performance monitoring
   - Email delivery tracking

4. **Deploy:**
   - Use environment-specific configs
   - Set up CI/CD
   - Use proper database (not in-memory tokens)
   - Add backup strategies

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review server logs
3. Check browser console
4. Verify all environment variables

Happy coding! 🎉