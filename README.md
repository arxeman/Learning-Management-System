<div align="center">

# 🗓️ LeavePro — Leave Management System

**A production-grade, full-stack web application for managing employee leaves**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat-square&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

*Built by **Aryeman Verma** (UID: 24BCS12515) — Chandigarh University*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Role & Permissions](#-roles--permissions)
- [Leave Types & Balances](#-leave-types--balances)
- [Leave Lifecycle](#-leave-lifecycle)
- [Database Schema](#-database-schema)
- [Demo Credentials](#-demo-credentials)
- [Troubleshooting](#-troubleshooting)

---

## 🌐 Overview

LeavePro is a complete **Leave Management System** with role-based access control, JWT authentication, and a modern React frontend. It allows organisations to digitise the entire leave lifecycle — from application and approval through to balance tracking and admin oversight — without manual spreadsheets or email chains.

```
Browser (React 18 + Vite)
    │  Axios + Bearer JWT
    ▼
Spring Boot 3.2 Backend  (/api/**)
    │  Spring Data JPA
    ▼
MySQL 8  (leave_management_db)
```

---

## ✨ Features

### 👤 Employee
- Apply for **Casual, Sick, Earned, or Unpaid** leave with automatic working-day calculation
- View **real-time leave balance** cards with progress bars (Casual / Sick / Earned)
- Browse full **leave history** with filter tabs (All / Pending / Approved / Rejected / Cancelled)
- **Cancel** pending or approved leave requests (approved cancellations restore balance)

### 👔 Manager
- All Employee features for own leaves
- **Manage team leaves** — view all requests from direct reports
- **Approve or reject** leave requests with optional comments / mandatory rejection reason
- Dashboard alert badge showing count of pending team requests

### 🛡️ Admin
- All Manager features
- **Full user CRUD** — create, edit, assign roles, link managers, deactivate
- **All-system leave view** — every request across all teams, filterable by status
- **Seed demo data** with one click to populate representative users and hierarchy

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| Spring Boot | 3.2.5 | Application framework |
| Spring Security | 6.x | Authentication & authorisation |
| Spring Data JPA | 3.2.5 | ORM & repository abstraction |
| Hibernate | 6.x | JPA provider; DDL auto-generation |
| MySQL Connector/J | 8.x | JDBC driver |
| JJWT | 0.12.5 | JWT signing & validation (HMAC-SHA256) |
| Lombok | 1.18.x | Boilerplate reduction |
| Java | 17 | LTS runtime |
| Maven | 3.8+ | Build & dependency management |

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 18.3.1 | UI library |
| React Router DOM | 6.23.1 | Client-side routing |
| Vite | 5.2.13 | Build tool & dev server |
| Axios | 1.7.2 | HTTP client with JWT interceptors |
| Tailwind CSS | 3.4.4 | Utility-first styling |
| Lucide React | 0.383.0 | Icons |
| React Hot Toast | 2.4.1 | Notification toasts |
| date-fns | 3.6.0 | Date formatting |

---

## 📁 Project Structure

```
leave-management-system/
│
├── backend/                                      # Spring Boot application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/lms/
│       │   ├── LeaveManagementApplication.java   # Entry point
│       │   │
│       │   ├── config/
│       │   │   └── SecurityConfig.java           # SecurityFilterChain, CORS, BCrypt
│       │   │
│       │   ├── controller/
│       │   │   ├── AuthController.java           # POST /api/auth/**
│       │   │   ├── LeaveController.java          # /api/leaves/**
│       │   │   ├── UserController.java           # /api/users/**
│       │   │   └── AdminController.java          # /api/admin/**
│       │   │
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   ├── LoginResponse.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── LeaveRequestDto.java
│       │   │   ├── UpdateLeaveStatusDto.java
│       │   │   ├── UserUpdateDto.java
│       │   │   └── ApiResponse.java              # Generic wrapper {success, message, data}
│       │   │
│       │   ├── model/
│       │   │   ├── User.java                     # @Entity — users table
│       │   │   ├── LeaveRequest.java             # @Entity — leave_requests table
│       │   │   └── LeaveBalance.java             # @Entity — leave_balances table
│       │   │
│       │   ├── repository/
│       │   │   ├── UserRepository.java           # JpaRepository<User, String>
│       │   │   ├── LeaveRequestRepository.java
│       │   │   └── LeaveBalanceRepository.java
│       │   │
│       │   ├── security/
│       │   │   ├── JwtTokenProvider.java         # Generate & validate JWT
│       │   │   ├── JwtAuthenticationFilter.java  # Per-request Bearer token check
│       │   │   └── JwtAuthenticationEntryPoint.java # 401 JSON response
│       │   │
│       │   └── service/
│       │       ├── AuthService.java              # login(), register()
│       │       ├── LeaveService.java             # applyLeave(), updateLeaveStatus()…
│       │       ├── UserService.java              # CRUD, stats
│       │       └── CustomUserDetailsService.java # Spring Security integration
│       │
│       └── resources/
│           └── application.properties
│
└── frontend/                                     # React + Vite application
    ├── index.html
    ├── vite.config.js                            # Proxy /api → localhost:8080
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx                              # ReactDOM.createRoot
        ├── App.jsx                               # Routes + ProtectedRoute
        ├── index.css                             # Tailwind directives + component classes
        │
        ├── api/
        │   └── axiosConfig.js                   # JWT interceptor, 401 redirect
        │
        ├── context/
        │   └── AuthContext.jsx                  # user, login(), logout(), isAdmin()
        │
        ├── components/
        │   ├── Layout.jsx                       # Sidebar + Navbar shell
        │   ├── Sidebar.jsx                      # Role-filtered nav + user pill
        │   └── Navbar.jsx                       # Top bar + mobile hamburger
        │
        └── pages/
            ├── Login.jsx                        # Auth form + demo fill buttons
            ├── Dashboard.jsx                    # Balance cards + stats + recent leaves
            ├── ApplyLeave.jsx                   # Leave application form
            ├── MyLeaves.jsx                     # Employee history + cancel
            ├── ManageLeaves.jsx                 # Manager approval table + modal
            └── AdminPanel.jsx                   # User CRUD + all-leaves tab
```

---

## 📦 Prerequisites

| Tool | Minimum Version | Check |
|---|---|---|
| Java JDK | 17 | `java -version` |
| Maven | 3.8 | `mvn -version` |
| Node.js | 18 | `node -version` |
| npm | 9 | `npm -version` |
| MySQL Server | 8.0 | `mysql --version` |

> **Windows users:** MySQL can be downloaded from [mysql.com/downloads](https://dev.mysql.com/downloads/installer/). During installation select **"Developer Default"** and ensure the MySQL service is set to start automatically.

---

## 🚀 Quick Start

### 1. Clone / Extract

```bash
# If cloning from git
git clone <your-repo-url>
cd leave-management-system

# Or extract the zip and cd into it
```

### 2. Configure MySQL

Open `backend/src/main/resources/application.properties` and set your MySQL credentials:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD   # ← change this
```

> The database `leave_management_db` is **auto-created** on first startup by the JDBC URL parameter `createDatabaseIfNotExist=true`. All tables are auto-created by Hibernate (`ddl-auto=update`). No SQL scripts needed.

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Expected output:
```
Started LeaveManagementApplication in 4.2 seconds
Tomcat started on port 8080
```

### 4. Start the Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v5.2.13  ready in 312 ms
➜  Local:   http://localhost:5173/
```

### 5. Seed Demo Data

On first run, create demo users by hitting the seed endpoint.

**Option A — Browser / Postman:**
```
POST http://localhost:8080/api/admin/seed
```
> No auth required for the seed endpoint on first boot (no admin exists yet to authenticate with).

**Option B — curl (Windows PowerShell):**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/admin/seed" -Method POST
```

**Option C — Admin Panel UI:**
Log in as `admin@lms.com / admin123` → Admin Panel → click **"Seed Demo Data"**.

### 6. Open the App

Navigate to **[http://localhost:5173](http://localhost:5173)** and log in with any demo account.

---

## ⚙️ Configuration

All backend configuration lives in `backend/src/main/resources/application.properties`:

```properties
# ── Server ────────────────────────────────────────────────────────────────────
server.port=8080

# ── MySQL ─────────────────────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/leave_management_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root           # ← change to your password

# ── JPA ───────────────────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=update      # use 'validate' in production
spring.jpa.show-sql=false                 # set true to log SQL queries

# ── JWT ───────────────────────────────────────────────────────────────────────
app.jwt.secret=3cfa76ef14937c1c0ea519f8fc057a80fcd04a7420f8e8bcd0a7567c272e007b
app.jwt.expiration-ms=86400000            # 24 hours

# ── CORS ──────────────────────────────────────────────────────────────────────
app.cors.allowed-origins=http://localhost:5173
```

> **Security note:** Change `app.jwt.secret` to a strong random 64-hex-char string before any public deployment. Never commit real credentials to version control.

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login → returns JWT + user info | Public |
| `POST` | `/api/auth/register` | Register new user | Public |

**Login request body:**
```json
{
  "email":    "admin@lms.com",
  "password": "admin123"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token":      "eyJhbGci...",
    "type":       "Bearer",
    "id":         "uuid",
    "name":       "Admin User",
    "email":      "admin@lms.com",
    "role":       "ROLE_ADMIN",
    "department": "IT"
  }
}
```

---

### Leaves

| Method | Path | Description | Roles |
|---|---|---|---|
| `POST` | `/api/leaves/apply` | Apply for leave | All |
| `GET` | `/api/leaves/my` | My leave history | All |
| `GET` | `/api/leaves/balance` | My leave balance | All |
| `PATCH` | `/api/leaves/{id}/cancel` | Cancel a leave | All (own) |
| `GET` | `/api/leaves/team` | All team leaves | Manager, Admin |
| `GET` | `/api/leaves/pending` | Pending team leaves | Manager, Admin |
| `PATCH` | `/api/leaves/{id}/status` | Approve or reject | Manager, Admin |
| `GET` | `/api/leaves/all` | All system leaves | Admin |

**Apply leave request body:**
```json
{
  "leaveType": "CASUAL",
  "startDate": "2026-07-10",
  "endDate":   "2026-07-12",
  "reason":    "Family function"
}
```

**Approve / Reject request body:**
```json
{
  "status":  "APPROVED",
  "comment": "Approved. Enjoy your time off."
}
```
```json
{
  "status":  "REJECTED",
  "comment": "Critical release sprint. Please reschedule."
}
```

---

### Users

| Method | Path | Description | Roles |
|---|---|---|---|
| `GET` | `/api/users/me` | Current user profile | All |
| `GET` | `/api/users/managers` | List all managers | All |

---

### Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/users` | All users |
| `POST` | `/api/admin/users` | Create user |
| `PUT` | `/api/admin/users/{id}` | Update user |
| `DELETE` | `/api/admin/users/{id}` | Delete user |
| `GET` | `/api/admin/stats` | User count by role |
| `POST` | `/api/admin/seed` | Seed demo data |

---

## 👥 Roles & Permissions

| Feature | Employee | Manager | Admin |
|---|:---:|:---:|:---:|
| Apply for leave | ✅ | ✅ | ✅ |
| View own leave history | ✅ | ✅ | ✅ |
| Cancel own leave | ✅ | ✅ | ✅ |
| View own leave balance | ✅ | ✅ | ✅ |
| View team leaves | ❌ | ✅ | ✅ |
| Approve / Reject leaves | ❌ | ✅ | ✅ |
| View ALL system leaves | ❌ | ❌ | ✅ |
| User management (CRUD) | ❌ | ❌ | ✅ |
| Seed demo data | ❌ | ❌ | ✅ |

---

## 📅 Leave Types & Balances

| Type | Default Days/Year | Balance Enforced | Notes |
|---|:---:|:---:|---|
| **CASUAL** | 12 | Yes | Personal errands, short breaks |
| **SICK** | 7 | Yes | Medical reasons, health issues |
| **EARNED** | 15 | Yes | Accrued annual leave entitlement |
| **UNPAID** | Unlimited | Tracked (no cap) | `unpaidUsed` count increments; no rejection for balance |

**Balance rules:**
- Balance is **checked before applying** — insufficient balance → `400 Bad Request`
- Balance is **deducted only when APPROVED** by a manager
- Cancelling an **APPROVED** leave **restores** the balance
- Cancelling a **PENDING** leave does not affect balance
- **Weekends** (Saturday & Sunday) are excluded from day counting

---

## 🔄 Leave Lifecycle

```
Employee applies
      │
      ▼
  [ PENDING ]  ◄─── Employee can CANCEL here (no balance impact)
      │
      ├─── Manager/Admin APPROVES ──► [ APPROVED ] ──► Employee CANCELs ──► balance restored
      │                                                                      status → CANCELLED
      └─── Manager/Admin REJECTS ──► [ REJECTED ]
```

---

## 🗄️ Database Schema

Three tables are auto-created by Hibernate on startup:

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) PK | UUID |
| `name` | VARCHAR(255) | |
| `email` | VARCHAR(255) UNIQUE | |
| `password` | VARCHAR(255) | BCrypt hash |
| `role` | VARCHAR(50) | `ROLE_ADMIN` / `ROLE_MANAGER` / `ROLE_EMPLOYEE` |
| `department` | VARCHAR(255) | |
| `manager_id` | VARCHAR(36) | Soft FK → users.id |
| `manager_name` | VARCHAR(255) | Denormalised for display |
| `active` | BIT(1) | `1` = active |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `leave_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) PK | UUID |
| `employee_id` | VARCHAR(36) | Soft FK → users.id |
| `employee_name` | VARCHAR(255) | |
| `employee_email` | VARCHAR(255) | |
| `leave_type` | VARCHAR(50) | `CASUAL` / `SICK` / `EARNED` / `UNPAID` |
| `start_date` | DATE | |
| `end_date` | DATE | |
| `number_of_days` | INT | Working days only |
| `reason` | TEXT | |
| `status` | VARCHAR(50) | `PENDING` / `APPROVED` / `REJECTED` / `CANCELLED` |
| `manager_id` | VARCHAR(36) | Soft FK → users.id |
| `manager_name` | VARCHAR(255) | |
| `rejection_reason` | VARCHAR(255) | |
| `approver_comment` | VARCHAR(255) | |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |
| `action_date` | DATETIME | When approved/rejected |

### `leave_balances`
| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) PK | UUID |
| `employee_id` | VARCHAR(36) | Soft FK → users.id |
| `year` | INT | e.g. `2026` |
| `casual_total` | INT | Default 12 |
| `casual_used` | INT | |
| `sick_total` | INT | Default 7 |
| `sick_used` | INT | |
| `earned_total` | INT | Default 15 |
| `earned_used` | INT | |
| `unpaid_used` | INT | |

---

## 🔑 Demo Credentials

Populated after running the seed endpoint:

| Role | Email | Password | Department |
|---|---|---|---|
| **Admin** | `admin@lms.com` | `admin123` | IT |
| **Manager** | `alice@lms.com` | `manager123` | Engineering |
| **Manager** | `bob@lms.com` | `manager123` | HR |
| **Employee** | `charlie@lms.com` | `emp123` | Engineering (reports to Alice) |
| **Employee** | `diana@lms.com` | `emp123` | Engineering (reports to Alice) |
| **Employee** | `eve@lms.com` | `emp123` | HR (reports to Bob) |

---

## 🔧 Troubleshooting

### `Access denied for user 'root'@'localhost'`
Your MySQL password in `application.properties` doesn't match. Update:
```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

### `Communications link failure` / `Connection refused`
MySQL isn't running. Start it:
```bash
# Windows (run as Administrator)
net start MySQL80

# macOS (Homebrew)
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Port 8080 already in use
```properties
# application.properties
server.port=8081
```
Then also update `vite.config.js` proxy target:
```js
target: 'http://localhost:8081'
```

### `npm install` fails on Node version
Ensure Node.js ≥ 18 is installed:
```bash
node -version   # should print v18.x or higher
```

### Tables not created / `Table doesn't exist`
Ensure `ddl-auto=update` is set (not `validate` or `none`):
```properties
spring.jpa.hibernate.ddl-auto=update
```

### JWT token rejected with 401 after restart
Tokens are signed with the secret in `application.properties`. If the secret changes (or the app restarts with a different one), existing tokens become invalid. Just log in again to obtain a fresh token.

---

## 📝 License

This project was created for educational purposes as part of the **InHouse Summer Industrial Training and Internship Programme** at Chandigarh University (2026).

---

<div align="center">
Made with ☕ and Spring Boot by <strong>Aryeman Verma</strong> — UID 24BCS12515
</div>#   L e a r n i n g - M a n a g e m e n t - S y s t e m  
 