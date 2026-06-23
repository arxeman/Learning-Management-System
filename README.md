# 🚀 LeavePro — Leave Management System

<p align="center">
  <strong>A Full-Stack Leave Management System built with Spring Boot, React, JWT Authentication, and MySQL</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk">
  <img src="https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql">
  <img src="https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens">
</p>

---

## 📖 Overview

LeavePro is a modern Leave Management System that automates the entire leave workflow within an organization.

Employees can apply for leave, managers can review and approve requests, and administrators can manage users and monitor leave activity across the organization.

The application implements Role-Based Access Control (RBAC), JWT Authentication, Leave Balance Management, and a responsive React frontend.

---

## ✨ Features

### 👨‍💼 Employee

* Apply for leave requests
* View leave history
* Track available leave balances
* Cancel pending or approved leaves
* Real-time leave status updates

### 👔 Manager

* View team leave requests
* Approve or reject applications
* Add comments during approval/rejection
* Track pending requests

### 🛡️ Administrator

* Create, edit and delete users
* Assign managers to employees
* View all leave records
* Manage organization-wide leave activities
* Seed demo data

---

## 🏗️ System Architecture

```text
┌─────────────────┐
│   React + Vite  │
└────────┬────────┘
         │ JWT Authentication
         ▼
┌─────────────────┐
│  Spring Boot    │
│ REST API Layer  │
└────────┬────────┘
         │ JPA/Hibernate
         ▼
┌─────────────────┐
│     MySQL       │
└─────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

* Java 17
* Spring Boot 3.2.5
* Spring Security
* Spring Data JPA
* Hibernate
* JWT Authentication
* Maven

### Frontend

* React 18
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide Icons
* React Hot Toast

### Database

* MySQL 8

---

## 📂 Project Structure

```text
leave-management-system
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── model
│   ├── security
│   └── config
│
├── frontend
│   ├── pages
│   ├── components
│   ├── context
│   ├── api
│   └── assets
│
└── README.md
```

---

## 📸 Screenshots

Add screenshots here after deployment.

### Login Page

```text
docs/login.png
```

### Dashboard

```text
docs/dashboard.png
```

### Apply Leave

```text
docs/apply-leave.png
```

### Admin Panel

```text
docs/admin-panel.png
```

---

## 🚀 Getting Started

### Prerequisites

* Java 17+
* Maven 3.8+
* Node.js 18+
* MySQL 8+

---

### Clone Repository

```bash
git clone https://github.com/arxeman/Learning-Management-System.git

cd Learning-Management-System
```

---

### Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Configure MySQL credentials in:

```properties
src/main/resources/application.properties
```

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Run backend:

```bash
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

### Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔐 Authentication

The application uses:

* JWT Authentication
* Spring Security
* Role-Based Access Control (RBAC)
* Password Encryption using BCrypt

Roles available:

* ROLE_EMPLOYEE
* ROLE_MANAGER
* ROLE_ADMIN

---

## 📅 Leave Types

| Leave Type   | Annual Allocation |
| ------------ | ----------------- |
| Casual Leave | 12 Days           |
| Sick Leave   | 7 Days            |
| Earned Leave | 15 Days           |
| Unpaid Leave | Unlimited         |

---

## 🔄 Leave Workflow

```text
Employee Applies
        │
        ▼
     PENDING
        │
 ┌──────┴──────┐
 │             │
 ▼             ▼
APPROVED    REJECTED
 │
 ▼
CANCELLED
```

---

## 🔌 API Endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
```

### Leave Management

```http
POST   /api/leaves/apply
GET    /api/leaves/my
GET    /api/leaves/balance
PATCH  /api/leaves/{id}/cancel
GET    /api/leaves/team
PATCH  /api/leaves/{id}/status
GET    /api/leaves/all
```

### User Management

```http
GET  /api/users/me
GET  /api/users/managers
```

### Admin

```http
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
POST   /api/admin/seed
```

---

## 🚀 Future Enhancements

* Email Notifications
* Attendance Tracking
* Holiday Calendar Integration
* Payroll Integration
* Docker Deployment
* Cloud Hosting Support
* Analytics Dashboard

---

## 👨‍💻 Author

**Aryeman Verma**

B.Tech CSE
Chandigarh University

GitHub: https://github.com/arxeman

---

## 📄 License

This project was developed as part of academic and internship training purposes.

---

<p align="center">
Built with ❤️ using Spring Boot, React & MySQL
</p>
