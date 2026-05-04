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
