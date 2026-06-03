# Argos System

Enterprise AI-Powered IT Service Management Platform

Argos System is a modern AI-powered IT Service Management (ITSM) platform designed to help organizations manage incidents, support tickets, notifications, audits, reporting, and AI-assisted troubleshooting through a centralized dashboard.

---

## Highlights

* AI-powered IT incident analysis
* OpenAI-powered troubleshooting recommendations
* Real-time ticket management with Socket.IO
* SLA tracking and monitoring
* Redis Cloud caching and background job processing
* JWT Authentication and Role-Based Access Control (RBAC)
* Knowledge Base for internal documentation
* Audit logging and compliance tracking
* PDF and CSV report generation
* Enterprise dashboard analytics
* MongoDB Atlas cloud database
* Render backend deployment
* Vercel frontend deployment
* Uptime monitoring and health checks
* Cypress End-to-End Testing
* Automated UI Testing

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
* Intelligent incident summaries

### Dashboard Analytics

* Total tickets overview
* Open tickets statistics
* In Progress statistics
* Resolved statistics
* High Priority monitoring
* Real-time dashboard refresh
* Charts and visual analytics

### Notifications

* Critical incident alerts
* SLA overdue notifications
* Unassigned ticket warnings
* Real-time notification updates

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

### Knowledge Base

* Internal troubleshooting articles
* Searchable IT documentation
* Knowledge repository management

### Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Protected API routes
* Admin & Agent permissions

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
* Axios
* Recharts
* Socket.IO Client
* Lucide React
* Cypress

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Socket.IO
* Redis Cloud
* BullMQ
* JWT Authentication
* bcryptjs
* OpenAI API
* PDFKit
* json2csv
* Multer

### Cloud Infrastructure

* MongoDB Atlas
* Redis Cloud
* Render
* Vercel
* UptimeRobot

---

## Architecture

### Frontend

```txt
React
 ├─ Dashboard
 ├─ Tickets
 ├─ Ticket Details
 ├─ Create Ticket
 ├─ AI Assistant
 ├─ Knowledge Base
 ├─ Notifications
 ├─ Audit Log
 ├─ Test Center
 ├─ Settings
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

## Deployment

### Production Infrastructure

Frontend

* Vercel

Backend

* Render

Database

* MongoDB Atlas

Cache & Queue

* Redis Cloud

Monitoring

* UptimeRobot
* Health Check Endpoint

CI/CD

* GitHub
* Automatic Deployments
* Git-Based Deployment Pipeline

---

## Testing

Argos System includes automated end-to-end testing using Cypress.

### Current Test Coverage

* User Login
* Ticket Creation
* Knowledge Base Search
* User Logout

### Testing Framework

* Cypress E2E Testing

```txt
Cypress
 ├─ login.cy.js
 ├─ create-ticket.cy.js
 ├─ knowledge-base.cy.js
 └─ logout.cy.js
```

---

## Monitoring

* Health Check Endpoint (`/api/health`)
* UptimeRobot Monitoring
* Automatic Availability Checks
* Production Uptime Tracking

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

OPENAI_API_KEY=your_openai_api_key

REDIS_URL=your_redis_connection
```

### Client (.env)

```env
VITE_API_URL=https://your-backend-url
```

---

## Demo Login

### Administrator

Email

```txt
admin@argos.com
```

Password

```txt
admin123
```

Role

```txt
Admin
```

---

## Screenshots

The repository includes screenshots demonstrating:

* Login Page
* Dashboard
* Ticket Management
* Ticket Details
* AI Assistant
* Knowledge Base
* Notifications
* Audit Logs
* Admin Panel
* Test Center

---

## Future Improvements

* File Attachment System
* Email Templates
* Mobile UI Enhancements
* Asset Management Module
* Advanced Dashboard Widgets
* User Profile Management
* Dark Mode
* Microsoft Entra ID Integration
* Single Sign-On (SSO)

---

## Author

**Tamás Zátrok**

Argos System

AI-Powered IT Service Management Platform

Built with React, TypeScript, Node.js, Express.js, MongoDB Atlas, Redis Cloud, Socket.IO, BullMQ, OpenAI and Cypress.
