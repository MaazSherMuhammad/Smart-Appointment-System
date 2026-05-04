
// ===== validation.js =====
// Validation Utilities
const Validation = {
    // Email validation
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Phone validation
    isValidPhone(phone) {
        const re = /^[0-9+\-\s]{10,15}$/;
        return re.test(phone);
    },
    
    // Password strength
    isStrongPassword(password) {
        return password.length >= 8;
    },
    
    // Required field
    isRequired(value) {
        return value !== null && value.toString().trim() !== '';
    },
    
    // Date validation
    isValidDate(date) {
        return !isNaN(new Date(date).getTime());
    },
    
    // Future date check
    isFutureDate(date) {
        return new Date(date) > new Date();
    },
    
    // Show error message
    showError(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        let errorEl = formGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            formGroup.appendChild(errorEl);
        }
        errorEl.textContent = message;
        errorEl.style.color = '#EF4444';
        errorEl.style.fontSize = '0.75rem';
        errorEl.style.marginTop = '4px';
        errorEl.style.display = 'block';
        input.style.borderColor = '#EF4444';
    },
    
    // Clear error
    clearError(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        const errorEl = formGroup.querySelector('.error-message');
        if (errorEl) errorEl.remove();
        input.style.borderColor = '';
    },
    
    // Validate form
    validateForm(formId, rules) {
        let isValid = true;
        const form = document.getElementById(formId);
        if (!form) return false;
        
        for (const [fieldId, rule] of Object.entries(rules)) {
            const input = document.getElementById(fieldId);
            if (!input) continue;
            
            this.clearError(input);
            
            if (rule.required && !this.isRequired(input.value)) {
                this.showError(input, rule.requiredMessage || 'This field is required');
                isValid = false;
            }
            
            if (rule.email && !this.isValidEmail(input.value)) {
                this.showError(input, 'Please enter a valid email address');
                isValid = false;
            }
            
            if (rule.phone && !this.isValidPhone(input.value)) {
                this.showError(input, 'Please enter a valid phone number');
                isValid = false;
            }
            
            if (rule.minLength && input.value.length < rule.minLength) {
                this.showError(input, `Minimum ${rule.minLength} characters required`);
                isValid = false;
            }
        }
        
        return isValid;
    }
};

// Global Toast Function
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Storage Utilities
const Storage = {
    save(key, data)   { localStorage.setItem(key, JSON.stringify(data)); },
    get(key)          { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    remove(key)       { localStorage.removeItem(key); },

    getAppointments() { return this.get('appointments') || []; },

    saveAppointment(apt) {
        const list = this.getAppointments();
        apt.id = apt.id || Date.now();
        apt.createdAt = apt.createdAt || new Date().toISOString();
        list.unshift(apt);
        this.save('appointments', list);
        return apt;
    },

    updateAppointment(id, changes) {
        const list = this.getAppointments();
        const idx  = list.findIndex(a => String(a.id) === String(id));
        if (idx === -1) return false;
        list[idx] = { ...list[idx], ...changes };
        this.save('appointments', list);
        return true;
    },

    deleteAppointment(id) {
        const before = this.getAppointments();
        const after  = before.filter(a => String(a.id) !== String(id));
        this.save('appointments', after);
        return after.length < before.length;
    }
};

// Category Data
const Categories = {
    healthcare: {
        name: 'Healthcare 🏥',
        services: [
            'Doctor Consultation',
            'Dentist Appointment',
            'Physiotherapy',
            'Mental Health Session',
            'Lab Tests',
            'Eye Checkup',
            'Vaccination'
        ],
        providers: [
            'Dr. Ahmed - General Physician',
            'Dr. Sarah - Cardiologist',
            'Dr. Ali - Dentist',
            'Dr. Fatima - Physiotherapist',
            'Dr. Omar - Psychiatrist'
        ]
    },
    business: {
        name: 'Business/Corporate 💼',
        services: [
            'Client Meeting',
            'Project Discussion',
            'Job Interview',
            'HR Meeting',
            'Team Building',
            'Sales Presentation'
        ],
        providers: [
            'Sarah Ahmed - HR Manager',
            'Omar Khan - Project Lead',
            'Fatima Ali - Sales Director',
            'Ahmed Raza - CEO'
        ]
    },
    educational: {
        name: 'Educational 🎓',
        services: [
            'Teacher Consultation',
            'Academic Advising',
            'Viva/Presentation',
            'Lab Session',
            'FYP Meeting',
            'Thesis Defense'
        ],
        providers: [
            'Prof. John - Computer Science',
            'Dr. Maria - Mathematics',
            'Dr. Ahmed - Engineering',
            'Prof. Sarah - Business'
        ]
    },
    personal: {
        name: 'Personal Services 💇',
        services: [
            'Salon/Haircut',
            'Spa/Massage',
            'Gym Trainer Session',
            'Makeup Artist',
            'Nail Art',
            'Personal Stylist'
        ],
        providers: [
            'Style Studio',
            'Luxury Spa',
            'Fitness First Gym',
            'Glamour Makeup'
        ]
    },
    government: {
        name: 'Government/Official 🏢',
        services: [
            'Passport Office',
            'Driving License',
            'NADRA/ID Services',
            'Visa Appointment',
            'Property Registration',
            'Court Hearing'
        ],
        providers: [
            'Passport Office - Karachi',
            'DL Center - Clifton',
            'NADRA Mega Center',
            'Visa Processing Center'
        ]
    },
    technical: {
        name: 'Technical/Repair 🔧',
        services: [
            'Electrician',
            'Plumber',
            'AC Repair',
            'IT Support',
            'Car Repair',
            'Home Appliance Repair'
        ],
        providers: [
            'Quick Fix Electricians',
            'Plumbing Pro',
            'Cool Air AC Services',
            'Tech Support Plus'
        ]
    }
};

// Get all categories
function getAllCategories() {
    return Object.keys(Categories).map(key => ({
        id: key,
        name: Categories[key].name,
        services: Categories[key].services,
        providers: Categories[key].providers
    }));
}

// ===== config.js =====
// ============================================================
//  AppointEase – Global Config & API Helper
// ============================================================

const API_BASE = 'http://localhost:8080/api';

// ── Authenticated fetch with 10-second timeout ────────────────
async function apiFetch(endpoint, options = {}) {
    const token = Storage.get('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(options.headers || {})
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await fetch(API_BASE + endpoint, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(timer);

        const text = await res.text();
        let json = {};
        try { json = text ? JSON.parse(text) : {}; } catch (e) {
            // Non-JSON response
            if (!res.ok) throw new Error('Server error ' + res.status);
            return {};
        }

        if (!res.ok) {
            // Use the message field from ApiResponse
            const msg = json.message || json.error || ('Error ' + res.status);
            throw new Error(msg);
        }
        return json;

    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out. Is the Spring Boot backend running on port 8080?');
        }
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            throw new Error('Cannot connect to backend (port 8080). Run: cd backend → mvn spring-boot:run');
        }
        throw err;
    }
}

// ── Role mapper ───────────────────────────────────────────────
function mapRole(backendRole) {
    const map = {
        'ADMIN': 'admin',
        'USER': 'user',
        'SERVICE_PROVIDER': 'service_provider'
    };
    return map[backendRole] || 'user';
}

// ── Time helpers ──────────────────────────────────────────────
// "09:00 AM" or "09:00" → "09:00:00"
function parseTimeToBackend(timeStr) {
    if (!timeStr) return '09:00:00';
    timeStr = timeStr.trim();
    // Already HH:MM:SS
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // HH:MM
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr + ':00';
    // "09:00 AM" format
    const parts = timeStr.split(' ');
    if (parts.length === 2) {
        const [hhmm, meridiem] = parts;
        let [h, m] = hhmm.split(':').map(Number);
        if (meridiem === 'AM' && h === 12) h = 0;
        if (meridiem === 'PM' && h !== 12) h += 12;
        return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00';
    }
    return timeStr + ':00';
}

// "09:00:00" → "09:00 AM"
function parseTimeFromBackend(timeStr) {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return String(h).padStart(2,'0') + ':' + m + ' ' + ampm;
}

// ── Category mappers ──────────────────────────────────────────
function categoryTypeToName(type) {
    const m = { HEALTHCARE:'Healthcare', BUSINESS:'Business', EDUCATIONAL:'Educational',
                GOVERNMENT:'Government', PERSONAL:'Personal Services', TECHNICAL:'Technical/Repair' };
    return m[type] || type;
}
function categoryNameToType(name) {
    const m = { 'Healthcare':'HEALTHCARE','Business':'BUSINESS','Educational':'EDUCATIONAL',
                'Government':'GOVERNMENT','Personal Services':'PERSONAL','Technical/Repair':'TECHNICAL' };
    return m[name] || name.toUpperCase();
}


// ===== auth.js =====
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


// ===== appointment.js =====
// ============================================================
//  AppointEase – Appointment Manager
// ============================================================

const AppointmentManager = {

    // ── Book ──────────────────────────────────────────────────
    async book(data) {
        const { serviceProviderId, categoryId, date, time, notes } = data;

        if (!serviceProviderId) { showToast('Please select a provider', 'error'); return false; }
        if (!categoryId)        { showToast('Category not resolved', 'error'); return false; }
        if (!date)              { showToast('Please select a date', 'error'); return false; }
        if (!time)              { showToast('Please select a time', 'error'); return false; }

        try {
            const payload = {
                serviceProviderId: parseInt(serviceProviderId),
                categoryId:        parseInt(categoryId),
                appointmentDate:   date,                      // "YYYY-MM-DD"
                appointmentTime:   parseTimeToBackend(time),  // "HH:MM:SS"
                notes:             notes || null,
                slotId:            null
            };

            const response = await apiFetch('/appointments/book', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const apt = response.data || response;
            this._cacheAdd(apt);
            showToast('✅ Appointment booked! Token: ' + (apt.tokenNumber || ''), 'success');
            return true;
        } catch (err) {
            showToast(err.message, 'error');
            return false;
        }
    },

    // ── Cancel ────────────────────────────────────────────────
    async cancelAppointment(appointmentId, reason) {
        try {
            await apiFetch('/appointments/cancel', {
                method: 'POST',
                body: JSON.stringify({
                    appointmentId: parseInt(appointmentId),
                    reason: reason || 'Cancelled by user'
                })
            });
            this._cacheUpdate(appointmentId, { status: 'CANCELLED' });
            showToast('Appointment cancelled', 'warning');
            return true;
        } catch (err) {
            showToast(err.message, 'error');
            return false;
        }
    },

    // ── Reschedule ────────────────────────────────────────────
    async rescheduleAppointment(appointmentId, newDate, newTime) {
        if (!newDate) { showToast('Please select a date', 'error'); return false; }
        if (!newTime) { showToast('Please select a time', 'error'); return false; }

        try {
            await apiFetch('/appointments/reschedule', {
                method: 'PUT',
                body: JSON.stringify({
                    appointmentId: parseInt(appointmentId),
                    newDate: newDate,
                    newTime: parseTimeToBackend(newTime)
                })
            });
            this._cacheUpdate(appointmentId, {
                appointmentDate: newDate,
                appointmentTime: parseTimeToBackend(newTime),
                status: 'RESCHEDULED'
            });
            showToast('✅ Appointment rescheduled!', 'success');
            return true;
        } catch (err) {
            showToast(err.message, 'error');
            return false;
        }
    },

    // ── Fetch from backend ────────────────────────────────────
    async getMyAppointments() {
        try {
            const res = await apiFetch('/appointments/my');
            const list = res.data || [];
            Storage.save('appointments', list);
            return list;
        } catch (err) {
            console.warn('Could not load appointments:', err.message);
            return Storage.getAppointments();
        }
    },

    async getHistory() {
        try {
            const res = await apiFetch('/appointments/history');
            return res.data || [];
        } catch (err) {
            console.warn('History load failed:', err.message);
            return Storage.getAppointments().filter(a =>
                ['COMPLETED','completed'].includes(a.status));
        }
    },

    async getAppointment(id) {
        try {
            const res = await apiFetch('/appointments/' + id);
            return res.data || null;
        } catch {
            return Storage.getAppointments().find(a => String(a.id) === String(id)) || null;
        }
    },

    // ── Providers ─────────────────────────────────────────────
    async getProvidersByCategory(categoryType) {
        try {
            const res = await apiFetch('/providers/category/' + categoryType);
            return res.data || [];
        } catch (err) {
            console.error('Failed to load providers:', err.message);
            return [];
        }
    },

    // ── Categories ────────────────────────────────────────────
    async getCategories() {
        try {
            const res = await apiFetch('/categories');
            return res.data || [];
        } catch { return []; }
    },

    // ── Admin methods ─────────────────────────────────────────
    async getAdminDashboard() {
        try {
            const res = await apiFetch('/admin/dashboard');
            return res.data || {};
        } catch (err) { console.error(err); return {}; }
    },

    async getAllAppointments() {
        try {
            const res = await apiFetch('/admin/appointments');
            return res.data || [];
        } catch (err) { console.error(err); return []; }
    },

    async getAppointmentsByCategoryType(type) {
        try {
            const res = await apiFetch('/admin/appointments/category/' + type);
            return res.data || [];
        } catch (err) { console.error(err); return []; }
    },

    async getAllUsers() {
        try {
            const res = await apiFetch('/admin/users');
            return res.data || [];
        } catch (err) { console.error(err); return []; }
    },

    async confirmAppointment(id) {
        try {
            await apiFetch('/admin/appointments/' + id + '/confirm', { method: 'PATCH' });
            showToast('Appointment confirmed', 'success');
            return true;
        } catch (err) { showToast(err.message, 'error'); return false; }
    },

    async completeAppointment(id) {
        try {
            await apiFetch('/admin/appointments/' + id + '/complete', { method: 'PATCH' });
            showToast('Marked as completed', 'success');
            return true;
        } catch (err) { showToast(err.message, 'error'); return false; }
    },

    async toggleUserStatus(userId) {
        try {
            await apiFetch('/admin/users/' + userId + '/toggle-status', { method: 'PATCH' });
            showToast('User status updated', 'success');
            return true;
        } catch (err) { showToast(err.message, 'error'); return false; }
    },

    // ── Stats helpers ─────────────────────────────────────────
    computeStats(appointments) {
        const upcoming  = appointments.filter(a =>
            !['CANCELLED','COMPLETED','cancelled','completed'].includes(a.status));
        const completed = appointments.filter(a =>
            ['COMPLETED','completed'].includes(a.status));
        const cancelled = appointments.filter(a =>
            ['CANCELLED','cancelled'].includes(a.status));
        return {
            total:     appointments.length,
            upcoming:  upcoming.length,
            completed: completed.length,
            cancelled: cancelled.length
        };
    },

    getStats()               { return this.computeStats(Storage.getAppointments()); },
    getUserAppointments()    { return Storage.getAppointments(); },
    getUpcomingAppointments(){ return Storage.getAppointments().filter(a =>
        !['CANCELLED','COMPLETED','cancelled','completed'].includes(a.status)); },
    getPastAppointments()    { return Storage.getAppointments().filter(a =>
        ['CANCELLED','COMPLETED','cancelled','completed'].includes(a.status)); },

    deleteAppointmentGlobal(id) {
        Storage.deleteAppointment(id);
        showToast('Removed from records', 'info');
        return true;
    },

    // ── Local cache helpers ───────────────────────────────────
    _cacheAdd(apt) {
        const list = Storage.getAppointments();
        list.unshift(apt);
        Storage.save('appointments', list);
    },
    _cacheUpdate(id, changes) {
        Storage.updateAppointment(id, changes);
    }
};


// ===== booking.js =====
// ============================================================
//  AppointEase – Booking Helper (shared by all category pages)
// ============================================================

const CATEGORY_TYPE_MAP = {
    'Healthcare':        'HEALTHCARE',
    'Business':          'BUSINESS',
    'Educational':       'EDUCATIONAL',
    'Government':        'GOVERNMENT',
    'Personal Services': 'PERSONAL',
    'Technical/Repair':  'TECHNICAL'
};

// Called from each category page DOMContentLoaded
async function initBookingPage(categoryName) {
    if (!Auth.requireAuth()) return;

    const user = Auth.getCurrentUser();
    if (user) {
        document.querySelectorAll('.user-name').forEach(el => el.textContent = user.fullName);
        document.querySelectorAll('.user-initials').forEach(el => {
            el.textContent = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        });
    }

    const categoryType = CATEGORY_TYPE_MAP[categoryName] || categoryName.toUpperCase();
    await loadProvidersForCategory(categoryType, categoryName);
}

async function loadProvidersForCategory(categoryType, categoryName) {
    const sel = document.getElementById('provider');
    if (!sel) return;

    sel.innerHTML = '<option value="">⏳ Loading providers...</option>';

    try {
        const providers = await AppointmentManager.getProvidersByCategory(categoryType);

        if (!providers || providers.length === 0) {
            sel.innerHTML = '<option value="">No providers available – admin must add some first</option>';
            // Store categoryId for booking anyway
            await _storeCategoryId(categoryType);
            return;
        }

        sel.innerHTML = '<option value="">-- Select Provider --</option>';
        providers.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.dataset.categoryId = p.categoryId;
            opt.dataset.providerName = p.businessName || '';
            opt.textContent = [p.businessName, p.specialization].filter(Boolean).join(' – ');
            sel.appendChild(opt);
        });

        // Cache categoryId globally from first provider
        if (providers[0] && providers[0].categoryId) {
            window._currentCategoryId = providers[0].categoryId;
        }
    } catch (err) {
        console.error('Provider load error:', err.message);
        sel.innerHTML = '<option value="">Error loading providers – is backend running?</option>';
    }
}

async function _storeCategoryId(categoryType) {
    try {
        const cats = await AppointmentManager.getCategories();
        const cat = cats.find(c => c.type === categoryType);
        if (cat) window._currentCategoryId = cat.id;
    } catch {}
}

async function submitBooking(e, categoryName) {
    e.preventDefault();

    const serviceEl  = document.getElementById('service');
    const providerEl = document.getElementById('provider');
    const dateEl     = document.getElementById('date');
    const timeEl     = document.getElementById('timeSlot') || document.getElementById('time');
    const notesEl    = document.getElementById('notes');

    const service  = serviceEl?.value;
    const date     = dateEl?.value;
    const time     = timeEl?.value;
    const notes    = notesEl?.value || '';

    // Validations
    if (!service)         { showToast('Please select a service type', 'error'); return; }
    if (!providerEl?.value || providerEl.value === '') {
        showToast('Please select a provider', 'error'); return;
    }
    if (!date)            { showToast('Please select a date', 'error'); return; }
    if (!time)            { showToast('Please select a time slot', 'error'); return; }

    const selectedDate = new Date(date);
    const today = new Date(); today.setHours(0,0,0,0);
    if (selectedDate < today) {
        showToast('Please select today or a future date', 'error'); return;
    }

    const categoryType = CATEGORY_TYPE_MAP[categoryName] || categoryName.toUpperCase();

    // Get categoryId: from selected provider option's dataset, or from cache
    const selectedOption = providerEl.options[providerEl.selectedIndex];
    let categoryId = selectedOption?.dataset?.categoryId
        ? parseInt(selectedOption.dataset.categoryId)
        : window._currentCategoryId;

    // If still no categoryId, fetch from /api/categories
    if (!categoryId) {
        try {
            const cats = await AppointmentManager.getCategories();
            const cat = cats.find(c => c.type === categoryType);
            if (cat) categoryId = cat.id;
        } catch {}
    }

    if (!categoryId) {
        showToast('Cannot resolve category. Make sure backend is running and has seeded data.', 'error');
        return;
    }

    const serviceProviderId = parseInt(providerEl.value);
    if (isNaN(serviceProviderId)) {
        showToast('Invalid provider selection', 'error'); return;
    }

    // Disable submit button
    const btn = document.querySelector('#bookingForm button[type="submit"]')
              || document.querySelector('button[onclick*="submitBooking"]');
    const origText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...'; }

    const ok = await AppointmentManager.book({
        serviceProviderId,
        categoryId,
        date,
        time,
        notes: notes || ('Service: ' + service)
    });

    if (btn) { btn.disabled = false; btn.innerHTML = origText; }

    if (ok) {
        setTimeout(() => { window.location.href = 'history.html'; }, 1800);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}
