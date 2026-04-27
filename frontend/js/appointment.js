// Appointment Module
const AppointmentManager = {
    // Book new appointment
    book(appointmentData) {
        if (!Validation.isRequired(appointmentData.category)) {
            showToast('Please select a category', 'error');
            return false;
        }

        if (!Validation.isRequired(appointmentData.service)) {
            showToast('Please select a service', 'error');
            return false;
        }

        if (!Validation.isRequired(appointmentData.provider)) {
            showToast('Please select a provider', 'error');
            return false;
        }

        if (!Validation.isValidDate(appointmentData.date)) {
            showToast('Please select a valid date', 'error');
            return false;
        }

        if (!Validation.isFutureDate(appointmentData.date)) {
            showToast('Please select a future date', 'error');
            return false;
        }

        if (!Validation.isRequired(appointmentData.time)) {
            showToast('Please select a time slot', 'error');
            return false;
        }

        const currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            showToast('Please login to book appointment', 'warning');
            return false;
        }

        const existingAppointments = Storage.getAppointments();
        const isDoubleBooked = existingAppointments.some(apt =>
            apt.provider === appointmentData.provider &&
            apt.date === appointmentData.date &&
            apt.time === appointmentData.time &&
            apt.status !== 'cancelled'
        );

        if (isDoubleBooked) {
            showToast('This time slot is already booked! Please select another time.', 'error');
            return false;
        }

        const appointment = {
            ...appointmentData,
            userId: currentUser.id,
            userName: currentUser.fullName,
            userEmail: currentUser.email,
            status: 'active',
            bookingDate: new Date().toISOString()
        };

        Storage.saveAppointment(appointment);
        showToast('Appointment booked successfully!', 'success');
        return true;
    },

    // Get user appointments
    getUserAppointments() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return [];

        const allAppointments = Storage.getAppointments();
        return allAppointments.filter(apt => apt.userId === currentUser.id);
    },

    // Get upcoming appointments
    getUpcomingAppointments() {
        const now = new Date();
        return this.getUserAppointments().filter(apt => {
            const aptDate = new Date(`${apt.date}T${apt.time}`);
            return aptDate >= now && apt.status !== 'cancelled';
        }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    },

    // Get past appointments
    getPastAppointments() {
        const now = new Date();
        return this.getUserAppointments().filter(apt => {
            const aptDate = new Date(`${apt.date}T${apt.time}`);
            return aptDate < now || apt.status === 'cancelled';
        }).sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
    },

    // Cancel appointment
    cancelAppointment(appointmentId) {
        const updated = Storage.updateAppointment(appointmentId, { status: 'cancelled' });
        if (updated) {
            showToast('Appointment cancelled successfully', 'warning');
        }
        return updated;
    },

    // Reschedule appointment
    rescheduleAppointment(appointmentId, newDate, newTime) {
        if (!Validation.isValidDate(newDate)) {
            showToast('Please select a valid date', 'error');
            return false;
        }

        if (!Validation.isFutureDate(newDate)) {
            showToast('Please select a future date', 'error');
            return false;
        }

        const appointment = Storage.getAppointments().find(a => a.id === appointmentId);
        if (!appointment) return false;

        const existingAppointments = Storage.getAppointments();
        const isDoubleBooked = existingAppointments.some(apt =>
            apt.id !== appointmentId &&
            apt.provider === appointment.provider &&
            apt.date === newDate &&
            apt.time === newTime &&
            apt.status !== 'cancelled'
        );

        if (isDoubleBooked) {
            showToast('This time slot is already booked! Please select another time.', 'error');
            return false;
        }

        const updated = Storage.updateAppointment(appointmentId, {
            date: newDate,
            time: newTime,
            status: 'rescheduled',
            previousDate: appointment.date,
            previousTime: appointment.time
        });

        if (updated) {
            showToast('Appointment rescheduled successfully!', 'success');
        }

        return updated;
    },

    // Get appointment by ID
    getAppointment(id) {
        return Storage.getAppointments().find(a => a.id === id);
    },

    // Get stats
    getStats() {
        const appointments = this.getUserAppointments();
        const now = new Date();
        
        const upcoming = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
        const completed = appointments.filter(a => a.status === 'completed');
        const cancelled = appointments.filter(a => a.status === 'cancelled');

        return {
            total: appointments.length,
            upcoming: upcoming.length,
            completed: completed.length,
            cancelled: cancelled.length,
            byCategory: this.getAppointmentsByCategory()
        };
    },

    // Get appointments grouped by category
    getAppointmentsByCategory() {
        const appointments = this.getUserAppointments();
        const categories = {};

        appointments.forEach(apt => {
            if (!categories[apt.category]) {
                categories[apt.category] = 0;
            }
            categories[apt.category]++;
        });

        return categories;
    },

    // --- Doctor/Global Methods ---

    // Get all appointments in system
    getAllAppointmentsGlobal() {
        const all = Storage.getAppointments();
        return all.sort((a, b) => {
            const timeA = new Date(`${a.date} ${a.time}`).getTime() || 0;
            const timeB = new Date(`${b.date} ${b.time}`).getTime() || 0;
            return timeB - timeA;
        });
    },

    // Get global stats for doctor
    getGlobalStats() {
        const all = Storage.getAppointments();
        const now = new Date();

        const upcoming = all.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
        const completed = all.filter(a => a.status === 'completed');
        const cancelled = all.filter(a => a.status === 'cancelled');

        const uniqueAppointers = new Set(all.map(a => a.userId)).size;

        return {
            total: all.length,
            upcoming: upcoming.length,
            completed: completed.length,
            cancelled: cancelled.length,
            appointers: uniqueAppointers
        };
    },

    // Get appointments by category globally
    getAppointmentsByCategoryGlobal(category) {
        return Storage.getAppointments().filter(a => a.category === category)
            .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
    },

    // Complete appointment
    completeAppointment(appointmentId) {
        const updated = Storage.updateAppointment(appointmentId, { status: 'completed' });
        if (updated) {
            showToast('Appointment marked as completed', 'success');
        }
        return updated;
    },

    // Delete appointment (Hard delete)
    deleteAppointmentGlobal(appointmentId) {
        const updated = Storage.deleteAppointment(appointmentId);
        if (updated) {
            showToast('Appointment deleted from records', 'info');
        }
        return updated;
    },

    // --- Admin Methods ---
    
    // Get all users
    getAllUsers() {
        return Storage.get('users') || [];
    },

    // Delete user
    deleteUser(userId) {
        let users = Storage.get('users') || [];
        users = users.filter(u => u.id !== userId);
        Storage.save('users', users);
        
        // Also delete user's appointments
        let appointments = Storage.getAppointments();
        appointments = appointments.filter(a => a.userId !== userId);
        Storage.save('appointments', appointments);
        
        showToast('User deleted successfully', 'success');
        return true;
    },

    // Update user role
    updateUserRole(userId, newRole) {
        let users = Storage.get('users') || [];
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].role = newRole;
            Storage.save('users', users);
            showToast('User role updated', 'success');
            return true;
        }
        return false;
    },

    // Get system-wide stats for admin
    getSystemStats() {
        const users = Storage.get('users') || [];
        const appointments = Storage.getAppointments();
        
        const appointers = users.filter(u => u.role === 'appointer').length;
        const doctors = users.filter(u => u.role === 'doctor').length;
        const admins = users.filter(u => u.role === 'admin').length;
        
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
        const activeAppointments = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length;
        
        const categoryStats = {};
        appointments.forEach(apt => {
            if (!categoryStats[apt.category]) {
                categoryStats[apt.category] = 0;
            }
            categoryStats[apt.category]++;
        });
        
        return {
            users: { total: users.length, appointers, doctors, admins },
            appointments: { total: totalAppointments, completed: completedAppointments, cancelled: cancelledAppointments, active: activeAppointments },
            categoryStats
        };
    },

    // Bulk delete appointments by category
    bulkDeleteByCategory(category) {
        let appointments = Storage.getAppointments();
        appointments = appointments.filter(a => a.category !== category);
        Storage.save('appointments', appointments);
        showToast(`All ${category} appointments deleted`, 'success');
        return true;
    },

    // Get appointments by user
    getAppointmentsByUser(userId) {
        return Storage.getAppointments().filter(a => a.userId === userId);
    }
};