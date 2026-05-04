# Smart Appointment Management System
## Integrated Project – Run Instructions

---

## ✅ ISSUES FOUND & FIXED

### Frontend Issues Fixed:
1. **auth.js** – Was using localStorage only. Now calls `/api/auth/login` & `/api/auth/register`
2. **appointment.js** – Was using localStorage. Now calls all `/api/appointments/*` endpoints
3. **category booking pages** – Were saving to localStorage. Now call `/api/appointments/book`
4. **cancel.html** – Now calls `POST /api/appointments/cancel`
5. **reschedule.html** – Now calls `PUT /api/appointments/reschedule`
6. **history.html** – Now loads from `GET /api/appointments/my`
7. **user dashboard** – Now loads stats from backend
8. **admin dashboard** – Now loads from `GET /api/admin/dashboard`
9. **admin category pages** – Now load from `GET /api/admin/appointments/category/{type}`
10. **login.html** – Removed demo localStorage credentials, uses real JWT login
11. **register.html** – Removed localStorage, uses real API registration

### Backend Issues Fixed:
1. **ServiceProviderController** – `/api/providers/category/{type}` now accepts CategoryType string (HEALTHCARE etc.)
2. **SecurityConfig** – Added all required public endpoints, expanded CORS
3. **CancelAppointmentRequest** – Made `reason` field optional
4. **AppointmentService** – Handles null cancellation reason gracefully
5. **application.properties** – Cleaned up, set password to empty (change if needed)

### New Files Added:
- `frontend/js/config.js` – API_BASE, apiFetch helper, utility functions
- `frontend/js/booking.js` – Shared booking logic for all category pages

---

## 🚀 HOW TO RUN

### Step 1 – Start MySQL
```bash
# Make sure MySQL is running
# Default: root with empty password on port 3306
# The app will auto-create the database "smart_appointment_db"
```

### Step 2 – Configure Database Password
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
*(Leave empty if your MySQL root has no password)*

### Step 3 – Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
Or from your IDE: Run `SmartAppointmentApplication.java`

The backend starts at: **http://localhost:8080**

On first run, it automatically:
- Creates the `smart_appointment_db` database
- Seeds all 6 categories (Healthcare, Business, etc.)
- Creates admin user: `admin@smartappt.com` / `admin123`

### Step 4 – Open the Frontend
Use **VS Code Live Server** (recommended):
- Open `frontend/` folder in VS Code
- Right-click `index.html` → "Open with Live Server"
- Frontend runs at: **http://127.0.0.1:5500**

Or open `frontend/login.html` directly in a browser.

---

## 🔑 DEFAULT ACCOUNTS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartappt.com | admin123 |
| User | Register at register.html | (your choice) |
| Service Provider | Created by Admin | (set by admin) |

---

## 📋 API ENDPOINTS OVERVIEW

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login → returns JWT token |
| GET | /api/auth/me | Get current user profile |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/appointments/book | Book appointment |
| POST | /api/appointments/cancel | Cancel appointment |
| PUT | /api/appointments/reschedule | Reschedule appointment |
| GET | /api/appointments/my | Get my appointments |
| GET | /api/appointments/history | Get completed history |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/users | All users |
| GET | /api/admin/appointments | All appointments |
| GET | /api/admin/appointments/category/{type} | By category |
| PATCH | /api/admin/appointments/{id}/confirm | Confirm appointment |
| PATCH | /api/admin/appointments/{id}/complete | Mark complete |

### Categories & Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | All categories |
| GET | /api/providers/category/{TYPE} | Providers by category |

---

## 🔄 COMPLETE FLOW

1. **Register** → `POST /api/auth/register` → stored in MySQL
2. **Login** → `POST /api/auth/login` → returns JWT token
3. Token stored in `localStorage` → sent as `Authorization: Bearer <token>`
4. **Book** → Frontend selects provider → `POST /api/appointments/book`
5. **Cancel** → `POST /api/appointments/cancel` with appointmentId
6. **Reschedule** → `PUT /api/appointments/reschedule` with new date/time
7. **History** → `GET /api/appointments/my` loads from database

---

## ⚙️ ADDING SERVICE PROVIDERS (as Admin)

1. First register a user at `/register.html`
2. Login as admin
3. Go to Admin Dashboard → Users
4. Use "Promote" button to make a user a Service Provider
5. Providers will then appear in category booking pages

---

## 🐛 TROUBLESHOOTING

**"Cannot connect to server"**
→ Backend not running. Run `mvn spring-boot:run` in the backend folder.

**"CORS error" in browser console**
→ Make sure you're using Live Server (port 5500), not opening the file directly.
→ Or add `file://` to CORS origins in `application.properties`.

**"Access denied" on login**
→ Check credentials. Default admin: `admin@smartappt.com` / `admin123`

**MySQL connection error**
→ Check your password in `application.properties`. Make sure MySQL service is running.

**Providers list empty in booking pages**
→ No service providers exist yet. Admin must promote users to SERVICE_PROVIDER role.

