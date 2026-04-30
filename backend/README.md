# 🗓️ Smart Appointment Management System — Backend

> **Spring Boot 3.2 · MySQL · JWT · Spring Security**
> End-semester project — Software Construction & Development

---

## 📁 Project Structure

```
com.project.appointment
├── controller          REST API endpoints
│   ├── AuthController
│   ├── AppointmentController
│   ├── CategoryController
│   ├── ServiceProviderController
│   └── AdminController
│
├── service             Business logic
│   ├── AuthService
│   ├── AppointmentService
│   ├── CategoryService
│   ├── ServiceProviderService
│   └── AdminService
│
├── repository          JPA repositories + custom queries
│   ├── UserRepository
│   ├── AppointmentRepository
│   ├── CategoryRepository
│   ├── ServiceProviderRepository
│   ├── AvailableSlotRepository
│   └── AppointmentHistoryRepository
│
├── entity              JPA entities (DB tables)
│   ├── User
│   ├── Category
│   ├── ServiceProvider
│   ├── AvailableSlot
│   ├── Appointment
│   └── AppointmentHistory
│
├── dto
│   ├── request         Incoming JSON payloads
│   └── response        Outgoing JSON responses
│
├── security            JWT filter + UserDetailsService
│   ├── JwtUtil
│   ├── JwtAuthenticationFilter
│   └── UserDetailsServiceImpl
│
├── config              Spring Security + CORS config
│   └── SecurityConfig
│
├── exception           Global exception handling
│   ├── ResourceNotFoundException
│   ├── AppointmentException
│   ├── UnauthorizedException
│   └── GlobalExceptionHandler
│
└── enums
    ├── Role
    ├── AppointmentStatus
    └── CategoryType
```

---

## 🗄️ Database Schema (ER Diagram)

```
users (1) ──────────────────────── (1) service_providers
  │                                           │
  │                                           │
  └─(M)──── appointments ───(M)──────────────┘
               │
               ├─(M)──── categories
               │
               ├─(1)──── available_slots
               │
               └─(1:M)── appointment_history
```

### Tables
| Table | Purpose |
|-------|---------|
| `users` | All system users (ADMIN, USER, SERVICE_PROVIDER) |
| `categories` | HEALTHCARE, BUSINESS, EDUCATIONAL, GOVERNMENT, PERSONAL, TECHNICAL |
| `service_providers` | Extended profile for service providers |
| `available_slots` | Pre-generated time slots per provider |
| `appointments` | Core booking records |
| `appointment_history` | Full audit trail of status changes |

---

## 🔌 API Reference — Frontend Mapping

### Authentication
| Method | Endpoint | Frontend Page | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | `register.html` | Register new user |
| POST | `/api/auth/login` | `login.html` | Login & receive JWT |
| GET | `/api/auth/me` | `dashboard/user.html` | Get logged-in user info |

### Appointments
| Method | Endpoint | Frontend Page | Description |
|--------|----------|---------------|-------------|
| POST | `/api/appointments/book` | `NEW/book.html` | Book appointment |
| POST | `/api/appointments/cancel` | `NEW/cancel.html` | Cancel appointment |
| PUT | `/api/appointments/reschedule` | `NEW/reschedule.html` | Reschedule appointment |
| GET | `/api/appointments/history` | `NEW/history.html` | Completed appointments |
| GET | `/api/appointments/my` | `dashboard/user.html` | All my appointments |
| GET | `/api/appointments/{id}` | — | Single appointment detail |
| GET | `/api/appointments/provider?date=` | `dashboard/appointer.html` | Provider's appointments |

### Categories (Public)
| Method | Endpoint | Frontend Page | Description |
|--------|----------|---------------|-------------|
| GET | `/api/categories` | `index.html` | All active categories |
| GET | `/api/categories/type/HEALTHCARE` | `NEW/healthcare.html` | Healthcare category |
| GET | `/api/categories/type/BUSINESS` | `NEW/business.html` | Business category |
| GET | `/api/categories/type/EDUCATIONAL` | `NEW/educational.html` | Educational category |
| GET | `/api/categories/type/GOVERNMENT` | `NEW/government.html` | Government category |
| GET | `/api/categories/type/PERSONAL` | `NEW/personal.html` | Personal category |
| GET | `/api/categories/type/TECHNICAL` | `NEW/technical.html` | Technical category |

### Service Providers
| Method | Endpoint | Frontend Page | Description |
|--------|----------|---------------|-------------|
| GET | `/api/providers/type/{type}` | `NEW/*.html` | Providers by category type |
| GET | `/api/providers/category/{id}` | `NEW/book.html` | Providers by category ID |
| GET | `/api/providers/search?name=` | — | Search providers |
| GET | `/api/providers/{id}` | — | Provider detail |
| GET | `/api/providers/me` | `dashboard/doctor.html` | Provider's own profile |
| POST | `/api/providers` | — | Create provider profile |
| PUT | `/api/providers/me` | `dashboard/doctor.html` | Update provider profile |

### Admin
| Method | Endpoint | Frontend Page | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/dashboard` | `dashboard/admin.html` | Stats & counters |
| GET | `/api/admin/users` | `dashboard/admin.html` | All users |
| GET | `/api/admin/providers` | `dashboard/admin.html` | All service providers |
| PATCH | `/api/admin/users/{id}/toggle-status` | `dashboard/admin.html` | Activate/deactivate user |
| PATCH | `/api/admin/users/{id}/promote` | `dashboard/admin.html` | Promote to provider |
| GET | `/api/admin/appointments` | `dashboard/admin.html` | All appointments |
| GET | `/api/admin/appointments/category/HEALTHCARE` | `dashboard/admin_healthcare.html` | Healthcare appointments |
| GET | `/api/admin/appointments/category/BUSINESS` | `dashboard/admin_business.html` | Business appointments |
| GET | `/api/admin/appointments/category/EDUCATIONAL` | `dashboard/admin_educational.html` | Educational appointments |
| GET | `/api/admin/appointments/category/GOVERNMENT` | `dashboard/admin_government.html` | Government appointments |
| GET | `/api/admin/appointments/category/PERSONAL` | `dashboard/admin_personal.html` | Personal appointments |
| GET | `/api/admin/appointments/category/TECHNICAL` | `dashboard/admin_technical.html` | Technical appointments |
| PATCH | `/api/admin/appointments/{id}/confirm` | `dashboard/admin.html` | Confirm appointment |
| PATCH | `/api/admin/appointments/{id}/complete` | `dashboard/admin.html` | Mark as completed |
| GET | `/api/admin/providers/category/{type}` | `dashboard/doctor_category.html` | Providers by type |
| POST | `/api/admin/categories/init` | — | Initialize seed categories |

---

## 🔐 Role-Based Access Control

| Role | Access |
|------|--------|
| `USER` | Book, cancel, reschedule own appointments; view own history |
| `SERVICE_PROVIDER` | View own appointments; manage own profile & slots |
| `ADMIN` | Full access to all endpoints |

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## 🚀 Setup & Run

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Steps

1. **Clone / extract the project**

2. **Create MySQL database**
```sql
CREATE DATABASE smart_appointment_db;
```
Or run the full schema:
```bash
mysql -u root -p < src/main/resources/schema.sql
```

3. **Configure database credentials**

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

4. **Build & run**
```bash
mvn clean install
mvn spring-boot:run
```

5. **Initialize categories** (first-time setup)
```bash
curl -X POST http://localhost:8080/api/admin/categories/init \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🔑 Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@smartappt.com` |
| Password | `admin123` |

---

## 📋 Sample API Calls

### Register
```json
POST /api/auth/register
{
  "fullName": "Ali Khan",
  "email": "ali@example.com",
  "password": "secret123",
  "phone": "03001234567"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "ali@example.com",
  "password": "secret123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": 2,
    "fullName": "Ali Khan",
    "email": "ali@example.com",
    "role": "USER"
  }
}
```

### Book Appointment
```json
POST /api/appointments/book
Authorization: Bearer <token>
{
  "serviceProviderId": 1,
  "categoryId": 1,
  "appointmentDate": "2025-06-15",
  "appointmentTime": "10:30:00",
  "notes": "First visit"
}
```

### Cancel Appointment
```json
POST /api/appointments/cancel
Authorization: Bearer <token>
{
  "appointmentId": 5,
  "reason": "Schedule conflict"
}
```

### Reschedule
```json
PUT /api/appointments/reschedule
Authorization: Bearer <token>
{
  "appointmentId": 5,
  "newDate": "2025-06-20",
  "newTime": "14:00:00",
  "reason": "Doctor unavailable"
}
```

---

## ✅ Features Implemented

- [x] JWT Authentication (login/register)
- [x] Role-Based Access Control (ADMIN, USER, SERVICE_PROVIDER)
- [x] Book / Cancel / Reschedule appointments
- [x] Appointment history & audit trail
- [x] Full admin dashboard APIs
- [x] Category management (all 6 types)
- [x] Service provider profile management
- [x] Available slot management
- [x] Global exception handling
- [x] Input validation with Bean Validation
- [x] DTO pattern (clean API contracts)
- [x] CORS configuration for frontend integration
- [x] Normalized MySQL schema with foreign keys
