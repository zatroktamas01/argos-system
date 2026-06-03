## How to Use the Application

### Step 1 - Login

Open the application:

```txt
https://argos-system-alpha.vercel.app
```

Use the administrator account:

```txt
Email: admin@argos.com
Password: admin123
```

After successful authentication, the system redirects the user to the main dashboard.

---

### Step 2 - Dashboard Overview

The Dashboard provides a real-time overview of the IT support environment.

You can monitor:

* Total Tickets
* Open Tickets
* In Progress Tickets
* Resolved Tickets
* High Priority Incidents
* Real-Time Ticket Statistics
* Interactive Charts

All statistics are generated from live ticket data stored in MongoDB Atlas.

---

### Step 3 - Create a Manual Ticket

Navigate to:

```txt
Create Ticket
```

Example:

```txt
Title:
Users cannot access corporate VPN

Category:
Network

Priority:
High

Likely Cause:
VPN gateway failure
```

Click:

```txt
Create Ticket
```

The ticket is immediately stored in MongoDB Atlas and becomes visible throughout the system.

---

### Step 4 - Analyze an Incident with AI

Navigate to:

```txt
AI Assistant
```

Example request:

```txt
Several employees cannot connect to the VPN after a firewall update.
Authentication succeeds but connections timeout.
```

Click:

```txt
Analyze Issue
```

The AI Assistant automatically generates:

* Ticket Title
* Category
* Priority
* Likely Cause
* Troubleshooting Steps
* Manual Test Cases
* Recommended Resolution

The AI is powered by OpenAI and automatically classifies incidents.

---

### Step 5 - Create a Ticket from AI Analysis

After analysis is completed, click:

```txt
Create Ticket
```

The generated incident information is automatically converted into a support ticket.

This demonstrates the AI-assisted ticket creation workflow.

---

### Step 6 - Manage Tickets

Navigate to:

```txt
Tickets
```

Open any ticket and perform actions such as:

* Change Status
* Assign Agents
* Add Comments
* Upload Attachments
* Review Activity History
* Monitor SLA Status

All changes are logged and tracked.

---

### Step 7 - Use the Knowledge Base

Navigate to:

```txt
Knowledge Base
```

Search for keywords:

```txt
VPN
Outlook
DNS
Windows
Active Directory
Printer
```

The system returns matching troubleshooting articles.

Administrators can create and manage knowledge articles.

---

### Step 8 - Monitor Notifications

Navigate to:

```txt
Notifications
```

The notification system displays:

* Critical Incidents
* SLA Violations
* Unassigned Tickets
* Operational Warnings

Notifications are updated in real time using Socket.IO.

---

### Step 9 - Review Audit Logs

Navigate to:

```txt
Audit Logs
```

Audit logs track:

* Ticket Creation
* Status Changes
* Ticket Assignments
* Comment Activity
* Administrative Actions

This provides traceability for support operations.

---

### Step 10 - Use the Admin Panel

Navigate to:

```txt
Admin Panel
```

Administrative capabilities include:

* User Management
* Role Management
* User Deletion
* System Administration
* Report Access

Only administrators can access these functions.

---

### Step 11 - Export Reports

Administrators can generate:

* PDF Reports
* CSV Reports

Reports contain:

* Ticket Statistics
* Priority Distribution
* Status Information
* SLA Data
* Assignment Information

---

### Step 12 - Run the Test Center

Navigate to:

```txt
Test Center
```

The Test Center validates:

* MongoDB Connectivity
* JWT Authentication
* Ticket Workflow
* Statistics Logic
* OpenAI Integration

This provides a quick health check of the platform.

---

### Step 13 - Automated Testing

The project includes Cypress End-to-End tests.

Available test suites:

```txt
login.cy.js
create-ticket.cy.js
knowledge-base.cy.js
logout.cy.js
```

Run locally:

```bash
cd client
npx cypress open
```

---

### Step 14 - Monitoring

Backend health monitoring is available through:

```txt
https://argos-backend-r1nu.onrender.com/api/health
```

Infrastructure monitoring is provided by:

* UptimeRobot
* Render Health Checks

This ensures service availability and uptime tracking.
