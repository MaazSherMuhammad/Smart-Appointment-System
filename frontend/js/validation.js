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
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    // Save appointment
    saveAppointment(appointment) {
        let appointments = this.get('appointments') || [];
        appointment.id = Date.now();
        appointment.createdAt = new Date().toISOString();
        appointments.push(appointment);
        this.save('appointments', appointments);
        return appointment;
    },
    
    // Get all appointments
    getAppointments() {
        return this.get('appointments') || [];
    },
    
    // Update appointment
    updateAppointment(id, updates) {
        let appointments = this.getAppointments();
        const index = appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...updates };
            this.save('appointments', appointments);
            return true;
        }
        return false;
    },
    
    // Delete appointment
    deleteAppointment(id) {
        let appointments = this.getAppointments();
        appointments = appointments.filter(a => a.id !== id);
        this.save('appointments', appointments);
        return true;
    },
    
    // Get appointments by category
    getAppointmentsByCategory(category) {
        return this.getAppointments().filter(a => a.category === category);
    },
    
    // Get user
    getCurrentUser() {
        return this.get('currentUser');
    },
    
    // Save user
    saveUser(user) {
        this.save('currentUser', user);
    },
    
    // Logout
    logout() {
        this.remove('currentUser');
        window.location.href = '../login.html';
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