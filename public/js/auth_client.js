// auth-client.js - Frontend authentication client
// This replaces your existing auth.js to work with the backend

const API_URL = 'http://localhost:3000/api';

class AuthClient {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = null;
    this.profile = null;
    this.ready = false;
    this.init();
  }

  async init() {
    console.log('🔄 AuthClient initializing...');
    
    if (this.token) {
      try {
        await this.loadCurrentUser();
      } catch (error) {
        console.error('Failed to load user:', error);
        this.logout();
      }
    }
    
    this.ready = true;
    console.log('✅ AuthClient ready');
  }

  async loadCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load user');
    }

    const data = await response.json();
    this.user = data.user;
    this.profile = data.profile;
    console.log('✅ User loaded:', this.user.email);
  }

  async register(email, password, fullName) {
    try {
      console.log('📝 Registering user:', email);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('✅ Registration successful');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    try {
      console.log('🔐 Logging in user:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsVerification) {
          window.UNVERIFIED_EMAIL = data.email;
        }
        throw new Error(data.error || 'Login failed');
      }

      // Save token
      this.token = data.token;
      localStorage.setItem('authToken', data.token);

      // Save user data
      this.user = data.user;
      this.profile = data.profile;

      console.log('✅ Login successful');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      console.log('🚪 Logging out...');
      
      if (this.token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
      }

      this.token = null;
      this.user = null;
      this.profile = null;
      localStorage.removeItem('authToken');

      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      console.log('📧 Sending password reset to:', email);
      
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      console.log('✅ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  async resendVerification(email) {
    try {
      console.log('📧 Resending verification email...');
      
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification');
      }

      console.log('✅ Verification email resent');
      return { success: true };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      return { success: false, error: error.message };
    }
  }

  async checkSession() {
    if (!this.token) {
      console.log('🔍 No token found');
      return false;
    }

    try {
      console.log('🔍 Checking session...');
      await this.loadCurrentUser();
      console.log('✅ Session valid');
      return true;
    } catch (error) {
      console.log('❌ Session invalid');
      this.logout();
      return false;
    }
  }

  isAuthenticated() {
    return !!this.user && !!this.token;
  }

  hasRole(role) {
    return this.user?.role === role;
  }

  getUser() {
    return this.user;
  }

  getProfile() {
    return this.profile;
  }

  getToken() {
    return this.token;
  }

  // Avatar helper methods
  getAvatarForUser(user, profile) {
    if (profile?.avatar) return profile.avatar;
    
    const email = user?.email || profile?.email || '';
    const name = profile?.full_name || email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=80&bold=true`;
  }
}

// Create and export singleton instance
export const authManager = new AuthClient();
window.authManager = authManager;

export default authManager;
