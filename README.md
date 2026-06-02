# Argos System

Enterprise AI-Powered IT Service Management Platform

Argos System is a modern AI-powered IT Service Management (ITSM) platform designed to help organizations manage incidents, support tickets, notifications, audits, reporting, and AI-assisted troubleshooting through a centralized dashboard.

---

## Highlights

* AI-powered IT incident analysis
* OpenAI-powered troubleshooting recommendations
* Real-time ticket management with Socket.IO
* SLA tracking and monitoring
* Redis + BullMQ background job processing
* JWT Authentication and Role-Based Access Control (RBAC)
* Knowledge Base for internal documentation
* Audit logging and compliance tracking
* PDF and CSV report generation
* Enterprise dashboard analytics

---

## Features

### Ticket Management

* Create support tickets
* Edit and update incidents
* Assign tickets to agents
* Priority management
* Status tracking
* SLA monitoring
* Ticket comments
* Activity history

### AI Assistant

* OpenAI integration
* AI-powered incident classification
* Root cause analysis
* Troubleshooting recommendations
* Automated priority detection
* IT keyword validation
* Intelligent incident summaries

### Dashboard Analytics

* Total tickets overview
* Open tickets statistics
* In Progress statistics
* Resolved statistics
* High Priority monitoring
* Realtime dashboard refresh
* Charts and visual analytics

### Notifications

* Critical incident alerts
* SLA overdue notifications
* Unassigned ticket warnings
* Realtime notification updates

### Audit Logging

* Ticket creation logs
* Assignment logs
* Status change logs
* Comment activity logs
* Administrative actions

### Reporting

* Enterprise PDF reports
* CSV exports
* Incident summaries
* SLA statistics
* Priority analysis

### Realtime System

* Socket.IO integration
* Live ticket updates
* Realtime dashboard updates
* Live notifications
* Online agent tracking

### Knowledge Base

* Internal troubleshooting articles
* Documentation system
* Searchable IT support knowledge repository

### Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Admin permissions
* Agent permissions
* Protected API routes

---

## Enterprise Features

* SLA Tracking
* Audit Logging
* Knowledge Base
* Real-time Notifications
* Ticket Assignment
* PDF & CSV Reporting
* Background Job Processing
* AI Incident Classification
* AI Incident Summaries
* User Administration

---

## Technology Stack

### Frontend

* React
* TypeScript
* React Router
* Tailwind CSS
* Recharts
* Axios
* Socket.IO Client
* Lucide React Icons

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* Redis
* BullMQ
* JWT Authentication
* bcryptjs
* Multer
* PDFKit
* json2csv
* OpenAI API

### Database

* MongoDB

### Realtime Infrastructure

* Socket.IO
* Redis
* BullMQ Workers
* Background Job Processing

---

## Architecture

### Frontend

```txt
React
 ├─ Dashboard
 ├─ Tickets
 ├─ Ticket Details
 ├─ AI Assistant
 ├─ Notifications
 ├─ Audit Logs
 ├─ Knowledge Base
 ├─ Test Center
 └─ Admin Panel
```

### Backend

```txt
Express API
 ├─ Authentication
 ├─ Ticket Management
 ├─ AI Services
 ├─ Reporting
 ├─ Notifications
 ├─ Audit Logs
 ├─ Socket.IO
 ├─ Redis Workers
 └─ OpenAI Integration
```

---

## Demo Login

### Administrator

Email: [admin@argos.com](mailto:admin@argos.com)

Password: admin123

Role: Admin

Permissions:

* Full system access
* User management
* Role management
* Ticket deletion
* Reporting
* Audit logs
* Knowledge Base management

---

## Installation

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm start
```

---

## Environment Variables

### Server (.env)

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_key

REDIS_URL=redis://localhost:6379
```

---

## Screenshots

A dedicated `/screenshots` directory is included in the repository containing screenshots of all major system modules and workflows.

Included screenshots:

* Login Page
* Dashboard Analytics
* Ticket Management
* Ticket Details & SLA Tracking
* AI Assistant
* Knowledge Base
* Notifications Center
* Audit Log
* Admin Panel
* Test Center

Browse the `/screenshots` folder to view the complete application interface.

---

## Future Improvements

* File Attachment System
* Email Notification Templates
* Asset Management Module
* Advanced Queue Monitoring
* Multi-Agent Workload Balancing
* Multi-Tenant Architecture
* Microsoft Entra ID Integration
* Single Sign-On (SSO)

---

## Author

Tamás

Argos System

Enterprise AI-Powered IT Service Management Platform

Built with React, TypeScript, Node.js, Express.js, MongoDB, Redis, BullMQ, Socket.IO and OpenAI.
