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
