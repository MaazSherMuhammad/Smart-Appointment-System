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
