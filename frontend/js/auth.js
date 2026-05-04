// ============================================================
//  AppointEase – Authentication  
//  Version guard ensures stale localStorage is cleared
// ============================================================

// ── Session version guard ─────────────────────────────────────
// Increment this when the auth data format changes
const SESSION_VERSION = '3';

(function enforceSessionVersion() {
    const stored = localStorage.getItem('sessionVersion');
    if (stored !== SESSION_VERSION) {
        // Clear all old auth data on version mismatch
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('appointments');
        localStorage.setItem('sessionVersion', SESSION_VERSION);
        console.log('[AppointEase] Session version updated → stale auth data cleared');
    }
})();

const Auth = {

    async register(userData) {
        if (!Validation.isRequired(userData.fullName)) {
            showToast('Full name is required', 'error'); return false;
        }
        if (!Validation.isValidEmail(userData.email)) {
            showToast('Please enter a valid email address', 'error'); return false;
        }
        if (!userData.password || userData.password.length < 6) {
            showToast('Password must be at least 6 characters', 'error'); return false;
        }
        if (userData.password !== userData.confirmPassword) {
            showToast('Passwords do not match', 'error'); return false;
        }

        try {
            const body = {
                fullName: userData.fullName.trim(),
                email:    userData.email.trim().toLowerCase(),
                password: userData.password,
                // Send null (not "") to avoid @Pattern validation on phone
                phone:    (userData.phone && userData.phone.trim()) ? userData.phone.trim() : null,
                role:     'USER'
            };
            const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(body)
            });
            showToast('✅ Account created! Redirecting to login...', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1800);
            return true;
        } catch (err) {
            showToast(err.message, 'error');
            return false;
        }
    },

    async login(email, password) {
        if (!email || !email.trim()) {
            showToast('Email is required', 'error'); return false;
        }
        if (!Validation.isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error'); return false;
        }
        if (!password) {
            showToast('Password is required', 'error'); return false;
        }

        try {
            const response = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email:    email.trim().toLowerCase(),
                    password: password
                })
            });

            // Backend returns: ApiResponse { data: AuthResponse { token, userId, fullName, role, email } }
            const payload  = response.data || response;
            const { token, userId, fullName, role, email: userEmail } = payload;

            if (!token) {
                showToast('Login failed: no token received from server', 'error');
                return false;
            }

            // Store with current session version
            localStorage.setItem('sessionVersion', SESSION_VERSION);
            Storage.save('authToken', token);
            Storage.save('currentUser', {
                id:          userId,
                fullName:    fullName || email,
                email:       userEmail || email,
                role:        mapRole(role),   // 'ADMIN'→'admin', 'USER'→'user'
                backendRole: role              // original: 'ADMIN' | 'USER' | 'SERVICE_PROVIDER'
            });

            showToast('✅ Welcome, ' + (fullName || email) + '!', 'success');

            // ── Role-based redirect ─────────────────────────────────
            // Determine correct dashboard based on role from BACKEND (not mapped)
            setTimeout(() => {
                const params   = new URLSearchParams(window.location.search);
                const redirect = params.get('redirect');
                if (redirect) { window.location.href = redirect; return; }

                // Use backendRole (raw from server) for redirect decision
                switch (role) {
                    case 'ADMIN':
                        window.location.href = 'dashboard/admin.html';
                        break;
                    case 'SERVICE_PROVIDER':
                        window.location.href = 'dashboard/doctor.html';
                        break;
                    default: // USER
                        window.location.href = 'dashboard/user.html';
                }
            }, 900);

            return true;
        } catch (err) {
            showToast(err.message, 'error');
            return false;
        }
    },

    logout() {
        // Clear ALL auth data
        Storage.remove('authToken');
        Storage.remove('currentUser');
        Storage.remove('appointments');
        // Keep sessionVersion so the cleanup doesn't re-trigger
        showToast('Logged out successfully', 'success');

        const inSub = window.location.pathname.includes('/appointments/') ||
                      window.location.pathname.includes('/dashboard/');
        setTimeout(() => {
            window.location.href = inSub ? '../login.html' : 'login.html';
        }, 600);
    },

    // ── Helpers ───────────────────────────────────────────────
    isLoggedIn() {
        return !!(Storage.get('authToken') && Storage.get('currentUser'));
    },

    getCurrentUser() {
        return Storage.get('currentUser');
    },

    getToken() {
        return Storage.get('authToken');
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            showToast('Please login to continue', 'warning');
            const inSub = window.location.pathname.includes('/appointments/') ||
                          window.location.pathname.includes('/dashboard/');
            setTimeout(() => {
                window.location.href = inSub ? '../login.html' : 'login.html';
            }, 800);
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!this.requireAuth()) return false;
        const u = this.getCurrentUser();
        if (!this.isAdmin()) {
            showToast('Admin access required', 'error');
            setTimeout(() => { window.location.href = '../login.html'; }, 1200);
            return false;
        }
        return true;
    },

    isAdmin() {
        const u = this.getCurrentUser();
        // Check BOTH mapped role and original backendRole to be safe
        return u && (u.role === 'admin' || u.backendRole === 'ADMIN');
    },

    isServiceProvider() {
        const u = this.getCurrentUser();
        return u && (u.role === 'service_provider' || u.backendRole === 'SERVICE_PROVIDER');
    }
};
