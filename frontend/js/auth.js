// Authentication Module
const Auth = {
    // Register new user
    register(userData) {
        if (!Validation.isRequired(userData.fullName)) {
            showToast('Full name is required', 'error');
            return false;
        }
        
        if (!Validation.isValidEmail(userData.email)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        if (!Validation.isStrongPassword(userData.password)) {
            showToast('Password must be at least 8 characters', 'error');
            return false;
        }
        
        if (userData.password !== userData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return false;
        }
        
        let users = Storage.get('users') || [];
        if (users.find(u => u.email === userData.email)) {
            showToast('User already exists with this email', 'error');
            return false;
        }
        
        const newUser = {
            id: Date.now(),
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'user',
            category: userData.category || null, // For category-specific admins
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        Storage.save('users', users);
        
        const credentials = Storage.get('credentials') || {};
        credentials[userData.email] = userData.password;
        Storage.save('credentials', credentials);
        
        showToast('Registration successful! Please login.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
        return true;
    },
    
    // Login user
    login(email, password, role) {
        if (!Validation.isValidEmail(email)) {
            showToast('Please enter a valid email', 'error');
            return false;
        }
        
        if (!Validation.isRequired(password)) {
            showToast('Password is required', 'error');
            return false;
        }
        
        const users = Storage.get('users') || [];
        const credentials = Storage.get('credentials') || {};
        
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showToast('User not found', 'error');
            return false;
        }
        
        if (credentials[email] !== password) {
            showToast('Invalid password', 'error');
            return false;
        }
        
        // Check role
        if (user.role !== role) {
            showToast(`Invalid role. You are registered as ${user.role}`, 'error');
            return false;
        }
        
        Storage.save('currentUser', user);
        
        showToast(`Welcome back, ${user.fullName}!`, 'success');
        
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            
            if (redirect) {
                window.location.href = redirect;
            } else if (role === 'user') {
                window.location.href = 'dashboard/user.html';
            } else if (role === 'healthcare_admin') {
                window.location.href = 'dashboard/admin_healthcare.html';
            } else if (role === 'business_admin') {
                window.location.href = 'dashboard/admin_business.html';
            } else if (role === 'educational_admin') {
                window.location.href = 'dashboard/admin_educational.html';
            } else if (role === 'personal_admin') {
                window.location.href = 'dashboard/admin_personal.html';
            } else if (role === 'government_admin') {
                window.location.href = 'dashboard/admin_government.html';
            } else if (role === 'technical_admin') {
                window.location.href = 'dashboard/admin_technical.html';
            }
        }, 1000);
        
        return true;
    },
    
    // Logout
    logout() {
        Storage.remove('currentUser');
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 500);
    },
    
    // Check if logged in
    isLoggedIn() {
        return Storage.get('currentUser') !== null;
    },
    
    // Get current user
    getCurrentUser() {
        return Storage.get('currentUser');
    },
    
    // Check if user is admin for a specific category
    isCategoryAdmin(category) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const categoryMap = {
            'Healthcare': 'healthcare_admin',
            'Business': 'business_admin',
            'Educational': 'educational_admin',
            'Personal Services': 'personal_admin',
            'Government': 'government_admin',
            'Technical/Repair': 'technical_admin'
        };
        
        return user.role === categoryMap[category];
    },
    
    // Require auth middleware
    requireAuth() {
        if (!this.isLoggedIn()) {
            showToast('Please login to continue', 'warning');
            const currentPath = window.location.pathname;
            const parts = currentPath.split('/');
            const filename = parts.pop();
            const folder = parts.pop();
            
            let redirectPath = filename;
            if (folder && (folder === 'appointments' || folder === 'dashboard')) {
                redirectPath = `${folder}/${filename}`;
            }
            
            const redirectParam = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
            
            setTimeout(() => {
                const loginPath = currentPath.includes('/appointments/') || currentPath.includes('/dashboard/') ? '../login.html' : 'login.html';
                window.location.href = `${loginPath}${redirectParam}`;
            }, 1000);
            return false;
        }
        return true;
    },
    
    // Require specific role
    requireRole(allowedRoles) {
        const user = this.getCurrentUser();
        if (!user) {
            this.requireAuth();
            return false;
        }
        
        if (!allowedRoles.includes(user.role)) {
            showToast('Access denied. Insufficient permissions.', 'error');
            setTimeout(() => {
                window.location.href = 'user.html';
            }, 1500);
            return false;
        }
        return true;
    }
};