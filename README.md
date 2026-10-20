# QueueFlow — Smart Queue Management System

> **A Full-Stack Web Application demonstrating client-side reactivity, geolocation, relational database operations, NoSQL persistence, and role-based access control.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen.svg)](https://www.mongodb.com/)
[![MySQL](https://img.shields.io/badge/MySQL-2.x-orange.svg)](https://www.mysql.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-2.x-4FC08D.svg)](https://v2.vuejs.org/)
[![License](https://img.shields.io/badge/License-Academic%20Use-lightgrey.svg)]()

---

## Table of Contents

1. [Project Title & Overview](#1-project-title--overview)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [Project Objectives](#3-project-objectives)
4. [Main Features & Functionality](#4-main-features--functionality)
5. [Technologies Used](#5-technologies-used)
6. [Complete Project Folder Structure](#6-complete-project-folder-structure)
7. [System Architecture & Request Flow](#7-system-architecture--request-flow)
8. [Explanation of Frontend & Backend Components](#8-explanation-of-frontend--backend-components)
9. [MongoDB Integration & Database Configuration](#9-mongodb-integration--database-configuration)
10. [MySQL Practical 8 Implementation](#10-mysql-practical-8-implementation)
11. [Practical 9: Role-Based Authentication & Access Control](#11-practical-9-role-based-authentication--access-control)
12. [Practical 10: Standalone MongoDB CRUD Implementation](#12-practical-10-standalone-mongodb-crud-implementation)
13. [FSD Practicals Matrix](#13-fsd-practicals-matrix)
14. [Prerequisites & Software Requirements](#14-prerequisites--software-requirements)
15. [Installation & Local Setup](#15-installation--local-setup)
16. [Environment Variable Configuration](#16-environment-variable-configuration)
17. [Running the Application Locally](#17-running-the-application-locally)
18. [Running Academic Practicals Independently](#18-running-academic-practicals-independently)
19. [API Endpoints Reference](#19-api-endpoints-reference)
20. [Database & Collection Setup](#20-database--collection-setup)
21. [Deployment Instructions](#21-deployment-instructions)
22. [Security Considerations](#22-security-considerations)
23. [Troubleshooting Common Errors](#23-troubleshooting-common-errors)
24. [Testing Checklist](#24-testing-checklist)
25. [Git & GitHub Workflow](#25-git--github-workflow)
26. [Known Limitations & Future Improvements](#26-known-limitations--future-improvements)
27. [Author & Contributor Information](#27-author--contributor-information)

---

## 1. Project Title & Overview

**QueueFlow** is a modern, responsive web application designed for smart queue and counter management. Developed as a comprehensive college Full Stack Development (FSD) project, QueueFlow demonstrates how physical waiting lines in banks, hospitals, government offices, and service centers can be replaced with an automated, contactless digital queue.

The project incorporates multiple core curriculum domains:
- **Client-Side Engineering:** Responsive UI design, CSS utility frameworks, dynamic DOM manipulation, HTML5 Geolocation, and Vue 2 custom directives.
- **Server-Side Engineering:** RESTful API design using Express 5, native HTTP server programming, modular route handling, and connection lifecycle management.
- **Database Engineering:** Relational SQL operations (MySQL) alongside NoSQL document modeling and atomic operations (MongoDB).
- **Security:** Header-based authentication and role-based access control (RBAC).

---

## 2. Problem Statement & Motivation

Traditional physical queuing systems suffer from significant inefficiencies:
- **Time Wastage & Fatigue:** Customers must stand in physical queues for extended periods without knowing their estimated turn.
- **Counter Congestion:** Service counters become crowded, causing confusion and elevated stress for both staff and visitors.
- **Lack of Transparency:** Customers have no visibility into how many tokens precede them or the status of their request.
- **Rigid Queue Structures:** Staff cannot seamlessly reorder, escalate, or update customer stages without manual paper slips.

**QueueFlow** solves these challenges by providing:
1. Virtual token issuance with instant token numbers and estimated wait times.
2. A live interactive queue dashboard displaying real-time token progression (`Waiting` $\rightarrow$ `Serving` $\rightarrow$ `Completed`).
3. Drag-and-drop queue reordering for counter executives that instantly persists order to the database.
4. Integrated branch geolocation mapping via Leaflet.js so customers can locate their service counter.

---

## 3. Project Objectives

- **Virtual Queue Automation:** Allow customers to book digital queue tokens (`A101`, `A102`, etc.) with their name and target department.
- **Reactive UI Management:** Update queue metrics, current token indicators, and wait-time approximations dynamically without full-page reloads.
- **Dual Database Demonstrations:** Support both relational SQL (MySQL for Practical 8) and document NoSQL (MongoDB for Practicals 7 and 10).
- **Security & RBAC Education:** Provide clear, viva-ready demonstrations of Authentication (*"Who are you?"*) versus Authorization (*"What are you allowed to do?"*).
- **Production Readiness:** Enable zero-configuration local development alongside cloud-ready deployment to platforms such as Render, Railway, or Vercel.

---

## 4. Main Features & Functionality

| Feature | Description | Implementation File |
| :--- | :--- | :--- |
| **Token Booking** | Customers generate sequential tokens with custom name and department. | `frontend/js/practical4.js` |
| **Live Metric Cards** | Displays active user token, position in line, estimated wait (~5 min/token), and status badge. | `frontend/dashboard.html` |
| **Interactive Queue Table** | Responsive table rendering all active tokens with real-time status toggles. | `frontend/js/practical7.js` |
| **Drag-and-Drop Reordering** | Executives reorder queue sequence via drag-and-drop; changes persist to MongoDB. | `frontend/js/practical7.js` & `backend/mongodb-api.js` |
| **Geolocation Mapping** | HTML5 Geolocation API pinpoints the user's coordinates on a Leaflet OpenStreetMap. | `frontend/js/practical4.js` |
| **Vue 2 Directives** | Custom directives (`v-uppercase`, `v-format-date`) perform dynamic DOM transforms. | `frontend/js/practical7.js` |
| **Offline Resilience** | Browser `localStorage` acts as a local cache when the backend is offline. | `frontend/js/practical7.js` |
| **Health Check Endpoint** | Server health probe (`/api/health`) reporting database status and token counts. | `backend/mongodb-api.js` |
| **Standalone Practicals** | Independent executable scripts for MySQL (P8), RBAC Auth (P9), and MongoDB CRUD (P10). | `backend/app.js`, `backend/PR9.js`, `backend/mongodb-crud.js` |

---

## 5. Technologies Used

### Frontend
- **HTML5:** Semantic layouts, forms, and responsive meta tags.
- **CSS3 & Responsive Design:** Custom modern design with flexbox and CSS grid layouts (`css/style.css`, `css/responsive.css`).
- **Bootstrap 5.3.3 (CDN):** Responsive grid utilities, cards, and modal button components.
- **Tailwind CSS (CDN):** Modern utility-first styling for cards, typography, badges, and colors.
- **Vue.js 2 (CDN):** Reactive data binding, event listeners, and custom DOM directives.
- **Leaflet.js 1.9.4:** Interactive OpenStreetMap tile rendering and marker mapping.

### Backend
- **Node.js (v18+ LTS / v20+ / v24+):** JavaScript runtime environment.
- **Express.js 5.x:** Minimalist HTTP framework for REST API routing and static asset serving.
- **Native Node.js `http` Module:** Pure built-in server architecture used in Practical 9.
- **CORS (`cors` 2.8.x):** Cross-Origin Resource Sharing middleware supporting flexible origin whitelisting.

### Databases
- **MongoDB (Driver 7.7.x):** Document store (`queueflow_db`) for queue tokens, timestamps, and order indices. Supports local MongoDB and MongoDB Atlas.
- **MySQL (Driver 2.18.x):** Relational store for Practical 8 table generation and DDL/DML queries.

---

## 6. Complete Project Folder Structure

```text
QueueFlow/
├── backend/
│   ├── node_modules/              # Installed Node.js dependencies
│   ├── .env.example               # Environment variable template with placeholders
│   ├── app.js                     # Practical 8: MySQL CRUD & DDL Demonstration
│   ├── mongodb-api.js             # QueueFlow Web API (Express + MongoDB)
│   ├── mongodb-crud.js            # Practical 10: Standalone MongoDB CRUD Script
│   ├── PR9.js                     # Practical 9: Role-Based Authentication & Access Control
│   ├── package.json               # Backend npm metadata, scripts, and dependencies
│   └── package-lock.json          # Dependency lockfile
├── frontend/
│   ├── assets/
│   │   └── queue-illustration.svg # Vector artwork for landing page
│   ├── css/
│   │   ├── responsive.css         # Mobile and tablet media queries
│   │   └── style.css              # Custom layout, card styles, and animations
│   ├── js/
│   │   ├── app.js                 # Authentication UI helpers and greeting state
│   │   ├── practical4.js          # Geolocation API, token booking, and deletion
│   │   └── practical7.js          # Vue 2 directives, drag-and-drop, and status sync
│   ├── dashboard.html             # Main customer queue monitoring dashboard
│   ├── index.html                 # Public landing page
│   └── login.html                 # Customer login portal
├── .gitignore                     # Git exclusion rules for secrets and node_modules
└── README.md                      # Comprehensive project documentation
```

---

## 7. System Architecture & Request Flow

```mermaid
flowchart TD
    subgraph Client ["Client Browser (Frontend)"]
        UI["HTML5 / Tailwind / Bootstrap"]
        VueApp["Vue.js 2 Instance (Current Queue)"]
        Geo["HTML5 Geolocation + Leaflet Map"]
        Cache["Local Storage (Offline Fallback)"]
    end

    subgraph Backend ["Node.js Express Backend (:3000)"]
        API["Express Router (/api)"]
        StaticServer["Express Static Middleware (../frontend)"]
        HealthEndpoint["/api/health"]
        TokenRoutes["/api/tokens (CRUD + Reorder)"]
    end

    subgraph Databases ["Database Engines"]
        MongoLocal[("Local MongoDB\n(:27017)")]
        MongoAtlas[("MongoDB Atlas\n(Cloud Cluster)")]
        MySQLDB[("Local MySQL\n(:3306)")]
    end

    subgraph Standalone ["Standalone Viva Practicals"]
        P8["Practical 8: app.js (MySQL)"]
        P9["Practical 9: PR9.js (:3001)"]
        P10["Practical 10: mongodb-crud.js"]
    end

    UI --> StaticServer
    VueApp <--> API
    API --> TokenRoutes
    API --> HealthEndpoint
    TokenRoutes --> MongoLocal
    TokenRoutes -.-> MongoAtlas
    P8 --> MySQLDB
    P10 --> MongoLocal
    P10 -.-> MongoAtlas
    VueApp <--> Cache
    Geo -.-> UI
```

---

## 8. Explanation of Frontend & Backend Components

### Frontend Components
- **`dashboard.html`:** The core operational view. Hosts 4 metric cards (Current Token, Queue Position, Estimated Wait, Status), a quick action bar for token booking/removal, a live Leaflet map with user coordinates, and the reactive queue table.
- **`login.html`:** A clean card-based authentication view storing session usernames in `localStorage` (`queueFlowUser`).
- **`index.html`:** The public entry point featuring a responsive hero banner and SVG illustration.
- **`practical4.js`:** Manages two Practical 4 learning modules: (1) HTML5 Geolocation API with Leaflet map markers, and (2) Token lifecycle events (booking via prompt and deletion requests sent to the backend).
- **`practical7.js`:** Powers the Vue 2 reactive view layer. Defines custom directives (`v-uppercase` and `v-format-date`), binds HTML5 drag-and-drop table rows, and synchronizes queue order with the backend via `PUT /api/tokens/reorder`.
- **`app.js`:** Handles login form redirects and personalized header greetings.

### Backend Components
- **`mongodb-api.js`:** The primary web server. Exposes REST endpoints, binds to `0.0.0.0` for cloud deployment, sanitizes database connection logs, applies CORS headers, and statically serves the `frontend/` directory.
- **`mongodb-crud.js`:** Standalone Practical 10 script implementing Create, Read, Update, and Delete operations in sequential order using an isolated test record (`TEST101`).
- **`PR9.js`:** Standalone Practical 9 script demonstrating role-based access control using the native Node.js `http` module on port `3001` (or `3000` via environment override).
- **`app.js`:** Standalone Practical 8 script executing relational SQL commands (DDL and DML) via the `mysql` driver.

---

## 9. MongoDB Integration & Database Configuration

QueueFlow uses the official MongoDB Node.js driver (`mongodb` v7.7). 

### Connection Strategy
The application dynamically selects its target database:
- **Local Development:** `mongodb://127.0.0.1:27017`
- **Cloud Production:** Any valid MongoDB Atlas SRV URI (`mongodb+srv://...`) passed via the `MONGODB_URI` environment variable.

### Document Schema (`tokens` Collection)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto | Internal MongoDB identifier. |
| `token` | `String` | Yes | Unique token code (e.g., `A101`, `T-101`, `TEST101`). Indexed uniquely. |
| `customer` | `String` | Yes | Customer name. |
| `department` | `String` | No | Target service counter (General, Accounts, Inquiry, Billing). |
| `status` | `String` | Yes | Queue status: `Waiting`, `Serving`, or `Completed`. |
| `order` | `Number` | Yes | Sequential sort order integer for drag-and-drop position. |
| `createdAt` | `Date` | Yes | Timestamp of initial document creation. |
| `joinedAt` | `String` | No | ISO timestamp string rendered in client views. |
| `updatedAt` | `Date` | No | Timestamp of the most recent modification. |

### Indexing
On startup, `mongodb-api.js` creates a unique index on the `token` field:
```javascript
await tokensCollection.createIndex({ token: 1 }, { unique: true });
```
This prevents duplicate queue tokens from colliding in the database.

---

## 10. MySQL Practical 8 Implementation

Located at `backend/app.js`, this script fulfills the Practical 8 curriculum requirements using the `mysql` client:
1. **Connection:** Connects to local MySQL on `localhost:3306` with credentials `root` / `""`.
2. **Database Creation:** Executes `CREATE DATABASE IF NOT EXISTS queueflow_db`.
3. **Table DDL:** Executes `CREATE TABLE IF NOT EXISTS queue_tokens (...)`.
4. **INSERT:** Inserts 3 sample records (`T-101`, `T-102`, `T-103`).
5. **UPDATE:** Updates status of token `T-101` to `'Serving'`.
6. **DELETE:** Deletes token `T-103`.
7. **SELECT:** Queries all active records from `queue_tokens`.
8. **SELECT DISTINCT:** Queries unique departments from `queue_tokens`.
9. **DROP TABLE:** Safely drops `queue_tokens` to demonstrate DDL cleanup and terminates the connection.

---

## 11. Practical 9: Role-Based Authentication & Access Control

Located at `backend/PR9.js`, this script demonstrates RBAC using **only Node.js's built-in `http` module** (no Express, no database).

### User Store
```javascript
const users = [
  { username: "meet", password: "1234", role: "admin" },
  { username: "student", password: "1234", role: "user" }
];
```

### Architecture
- **Authentication:** Inspects `req.headers.username` and `req.headers.password`. Missing or incorrect credentials immediately return `401 Unauthorized` (`{"message": "Authentication failed"}`).
- **Authorization:** 
  - Access to `/admin` requires `user.role === 'admin'`. Non-admin users receive `403 Forbidden` (`{"message": "Access denied. Admin only."}`).
  - Standard authenticated endpoints (e.g., `/user`) return `200 OK` with user details.

### Port Isolation
`PR9.js` listens on port `3001` by default:
```javascript
const PORT = process.env.PORT || 3001;
```
This ensures the QueueFlow website (`:3000`) and the Practical 9 server (`:3001`) can run simultaneously without port conflicts.

---

## 12. Practical 10: Standalone MongoDB CRUD Implementation

Located at `backend/mongodb-crud.js`, this script consolidates four individual database operations into a single viva-ready program:
1. **Connection:** Connects once to `queueflow_db` $\rightarrow$ `tokens`.
2. **Re-run Safety:** Detects and clears leftover test token `TEST101` so demonstrations always start in a clean state.
3. **CREATE:** Calls `collection.insertOne()` with `TEST101`.
4. **READ:** Calls `collection.find({}).toArray()` to display all collection documents, followed by `collection.findOne({ token: "TEST101" })`.
5. **UPDATE:** Uses atomic `$set` in `collection.updateOne()` to change status to `Serving` and department to `Helpdesk (Updated)`.
6. **DELETE:** Uses `collection.deleteOne({ token: "TEST101" })` with exact filter matching, protecting real customer records.
7. **CLEANUP:** Guarantees connection closure via `client.close()` inside a `finally` block.

---

## 13. FSD Practicals Matrix

| Practical | Curriculum Requirement | Implementation in QueueFlow |
| :--- | :--- | :--- |
| **Practical 3** | Responsive Web Design, Viewports & Media Queries | `frontend/css/responsive.css`, `index.html` viewport meta tag. |
| **Practical 4** | HTML5 Geolocation, LocalStorage & Drag-and-Drop | `frontend/js/practical4.js` (Leaflet map, cache, token prompt). |
| **Practical 5** | Bootstrap 5 Framework Integration | CDN integration in `dashboard.html` (cards, grid, buttons). |
| **Practical 6** | Tailwind CSS Framework Integration | Utility classes across `dashboard.html`, `login.html`, `index.html`. |
| **Practical 7** | Vue.js 2 Directives & Queue State Management | Custom directives (`v-uppercase`, `v-format-date`) in `practical7.js`. |
| **Practical 8** | MySQL Database CRUD & DDL Queries | `backend/app.js` (Table creation, CRUD, DISTINCT, DROP). |
| **Practical 9** | Role-Based Authentication & Access Control (RBAC) | `backend/PR9.js` (Built-in HTTP, headers, 401/403 handling). |
| **Practical 10** | MongoDB Database CRUD Operations | `backend/mongodb-crud.js` & `backend/mongodb-api.js`. |

---

## 14. Prerequisites & Software Requirements

- **Node.js:** Version 18.x LTS or higher ([Download Node.js](https://nodejs.org/))
- **npm:** Version 9.x or higher (bundled with Node.js)
- **MongoDB:** Local Community Server 6.0+ or a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- **MySQL Server:** Optional, required only for Practical 8 (e.g., via XAMPP, WampServer, or MySQL Community Server)
- **Web Browser:** Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari
- **API Testing Tool:** Postman, Thunder Client, or cURL

---

## 15. Installation & Local Setup

1. **Clone or Download the Repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd QueueFlow
   ```

2. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Verify Dependencies in `package.json`:**
   Ensure `express`, `mongodb`, `mysql`, and `cors` are installed.

---

## 16. Environment Variable Configuration

Create a `.env` file in the `backend/` folder based on `.env.example`:

```bash
cd backend
cp .env.example .env
```

### Supported Variables

```env
# Port on which the QueueFlow Express API will listen (Render sets this automatically)
PORT=3000

# Environment mode (development / production)
NODE_ENV=development

# MongoDB Connection String (Atlas URI in production; defaults to mongodb://127.0.0.1:27017 in development)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/

# Target database name
DB_NAME=queueflow_db

# Target collection name
COLLECTION_NAME=tokens

# CORS Allowed Origins (Set to your Vercel URL in production, e.g. https://your-app.vercel.app, or * for all)
CORS_ORIGIN=*
```

> [!IMPORTANT]
> - In development (`NODE_ENV !== 'production'`), if `MONGODB_URI` is not set, QueueFlow safely falls back to local `mongodb://127.0.0.1:27017`.
> - In production (`NODE_ENV === 'production'`), `MONGODB_URI` is strictly required. The backend will halt immediately with an explanatory error if it is missing, preventing silent connection attempts to non-existent local databases.
> - The `.env` file is excluded from Git via `.gitignore`. Never commit database passwords or private Atlas URIs to version control.

---

## 17. Running the Application Locally

1. **Ensure Local MongoDB is Running:**
   - **Windows:** Run `net start MongoDB` in an administrative terminal, or ensure the service is running in `services.msc`.
   - **Linux/macOS:** `sudo systemctl start mongod` or `brew services start mongodb-community`.

2. **Start the QueueFlow Server:**
   ```bash
   cd backend
   npm start
   ```

   *Console Output:*
   ```text
   [QueueFlow MongoDB API] Connected to MongoDB at: mongodb://127.0.0.1:27017
   [QueueFlow MongoDB API] Using Database: "queueflow_db", Collection: "tokens"
   [QueueFlow MongoDB API] Verified unique index on "token" field.
   [QueueFlow MongoDB API] Server running at http://localhost:3000
   Frontend URL: http://localhost:3000/dashboard.html
   ```

3. **Open the Web Application:**
   Navigate in your browser to:
   ```text
   http://localhost:3000/dashboard.html
   ```
   *(You can also access the public home page at `http://localhost:3000/index.html` or login at `http://localhost:3000/login.html`)*.

---

## 18. Running Academic Practicals Independently

All practicals can be demonstrated individually from the `backend/` directory without starting the full website:

### Practical 9: Role-Based Authentication
```bash
cd backend
npm run pr9
# or: node PR9.js
```
- Server starts on: `http://localhost:3001`
- Test via Postman with `GET http://localhost:3001/admin` using headers `username: meet` and `password: 1234`.

### Practical 10: Standalone MongoDB CRUD
```bash
cd backend
npm run crud
# or: node mongodb-crud.js
```
- Executes all 4 operations sequentially against `queueflow_db` and prints step-by-step console verifications.

### Practical 8: MySQL CRUD
```bash
cd backend
npm run mysql
# or: node app.js
```
- *Note:* Requires local MySQL Server running on port `3306` with database user `root` (no password).

---

## 19. API Endpoints Reference

Base URL (Local): `http://localhost:3000/api`

### 1. Health Status
- **Method:** `GET`
- **Route:** `/api/health`
- **Description:** Verifies server and MongoDB connectivity.
- **Success Response (200 OK):**
  ```json
  {
    "status": "ok",
    "database": "queueflow_db",
    "collection": "tokens",
    "totalTokens": 3,
    "message": "QueueFlow MongoDB API is active and connected"
  }
  ```

### 2. Retrieve All Tokens
- **Method:** `GET`
- **Route:** `/api/tokens`
- **Description:** Returns all tokens sorted by `order` and `createdAt`.
- **Success Response (200 OK):**
  ```json
  [
    {
      "_id": "6ace595d5bb47c3ba98316b2",
      "token": "A101",
      "customer": "Rahul",
      "department": "General",
      "status": "Waiting",
      "order": 1,
      "createdAt": "2026-10-20T08:00:00.000Z"
    }
  ]
  ```

### 3. Create a New Token
- **Method:** `POST`
- **Route:** `/api/tokens`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "token": "A104",
    "customer": "Priya Sharma",
    "department": "Accounts",
    "status": "Waiting"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Token created successfully in MongoDB",
    "insertedId": "6ad733af3c368af4c700ccdb",
    "token": {
      "token": "A104",
      "customer": "Priya Sharma",
      "department": "Accounts",
      "status": "Waiting",
      "order": 4
    }
  }
  ```
- **Error Response (409 Conflict):** If token already exists.

### 4. Update Token Details / Status
- **Method:** `PUT`
- **Route:** `/api/tokens/:token`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "status": "Serving"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Token \"A104\" updated successfully in MongoDB",
    "matchedCount": 1,
    "modifiedCount": 1
  }
  ```

### 5. Reorder Queue Sequence (Batch Write)
- **Method:** `PUT`
- **Route:** `/api/tokens/reorder`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "tokens": ["A102", "A101", "A103"]
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Queue order updated successfully in MongoDB",
    "count": 3
  }
  ```

### 6. Delete a Token
- **Method:** `DELETE`
- **Route:** `/api/tokens/:token`
- **Success Response (200 OK):**
  ```json
  {
    "message": "Token \"A104\" deleted successfully from MongoDB",
    "deletedCount": 1
  }
  ```
- **Error Response (404 Not Found):** If token does not exist.

---

## 20. Database & Collection Setup

### Inspecting with MongoDB Compass
1. Open **MongoDB Compass**.
2. Connect to URI: `mongodb://127.0.0.1:27017` (or your MongoDB Atlas connection string).
3. Under databases, locate `queueflow_db`.
4. Click on the `tokens` collection to view documents, schema types, and indexes.

---

## 21. Deployment Instructions

### Architecture Choice

```text
┌─────────────────────────────────────────────────────────────┐
│                 RECOMMENDED DEPLOYMENT                      │
│                                                             │
│   Unified Web Service on Render / Railway                   │
│   ├── Backend Node.js / Express API                         │
│   └── Frontend Statically Served via express.static()       │
│                           │                                 │
│                           ▼                                 │
│               MongoDB Atlas (Free M0 Cluster)               │
└─────────────────────────────────────────────────────────────┘
```

**Why this is recommended:**
- Zero cross-origin (CORS) complications.
- A single public URL for your viva presentation and resume.
- Automated deployments directly from your GitHub repository.

---

### Step-by-Step Deployment (Render.com)

#### Phase 1: Configure MongoDB Atlas (Free Cloud Database)
1. Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g., `queueflow_admin`) with password and Read/Write privileges.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) so cloud hosts can connect.
5. In your Cluster view, click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/queueflow_db?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials)*.

#### Phase 2: Deploy to Render
1. Push your project to a **GitHub repository** (ensure `.env` is NOT committed).
2. Sign in to [Render.com](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Set the service settings:
   - **Name:** `queueflow`
   - **Environment:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = *(your MongoDB Atlas connection string)*
   - `NODE_ENV` = `production`
   - `DB_NAME` = `queueflow_db`
   - `COLLECTION_NAME` = `tokens`
6. Click **Deploy Web Service**.
7. Once deployed, open your live URL:
   ```text
   https://your-service-name.onrender.com/dashboard.html
   ```

---

## 22. Security Considerations

- **Credential Sanitization:** Server connection logs automatically mask Atlas credentials (`mongodb+srv://<credentials>@...`) to prevent credential leakage in console streams.
- **Git Protection:** `.gitignore` actively excludes `.env`, `node_modules/`, and system caches.
- **CORS Management:** Configurable via `CORS_ORIGIN` in `.env` to restrict browser origins in production.
- **Unique Constraints:** Unique MongoDB indexing prevents duplicate token injection.
- **Practical 9 Demarcation:** The header-based authentication in `PR9.js` is designed exclusively for educational viva demonstration. For production consumer authorization, industry-standard JWT (JSON Web Tokens) or session cookies over HTTPS should be implemented.

---

## 23. Troubleshooting Common Errors

### Error: `ECONNREFUSED 127.0.0.1:27017`
- **Cause:** Local MongoDB service is stopped.
- **Fix:** Open PowerShell as Administrator and run:
  ```powershell
  net start MongoDB
  ```

### Error: `EADDRINUSE: address already in use :::3000`
- **Cause:** Another process is already running on port 3000.
- **Fix:** Terminate the occupying process or run Practical 9 on port 3001:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```

### Leaflet Map Tiles Not Loading
- **Cause:** Missing internet access or Leaflet CSS CDN blocked.
- **Fix:** Ensure an active internet connection to load OpenStreetMap tiles.

### CORS Errors in Browser Console
- **Cause:** Frontend loaded from an origin not permitted by backend.
- **Fix:** Set `CORS_ORIGIN=*` in `backend/.env` or serve frontend directly from `http://localhost:3000/dashboard.html`.

---

## 24. Testing Checklist

| Test Item | Verification Command | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **JS Syntax Check** | `node -c backend/mongodb-api.js` | Exit code 0 (No syntax errors) | Verified |
| **API Health Check** | `GET /api/health` | HTTP 200, `{"status": "ok"}` | Verified |
| **Token Read** | `GET /api/tokens` | HTTP 200, Array of tokens | Verified |
| **Token Booking** | `POST /api/tokens` | HTTP 201 Created | Verified |
| **Token Update** | `PUT /api/tokens/:token` | HTTP 200, `modifiedCount: 1` | Verified |
| **Queue Reorder** | `PUT /api/tokens/reorder` | HTTP 200, updated order | Verified |
| **Token Deletion** | `DELETE /api/tokens/:token` | HTTP 200, `deletedCount: 1` | Verified |
| **P10 Standalone CRUD**| `node backend/mongodb-crud.js` | All 4 operations PASS | Verified |
| **P9 Admin Auth** | `GET :3001/admin` (meet:1234) | HTTP 200 `Welcome Admin!` | Verified |
| **P9 User to Admin** | `GET :3001/admin` (student:1234) | HTTP 403 `Access denied.` | Verified |
| **P9 Bad Credentials** | `GET :3001/admin` (invalid) | HTTP 401 `Authentication failed` | Verified |
| **MySQL Practical 8** | `node backend/app.js` | DDL/DML cycles executed | Verified |

---

## 25. Git & GitHub Workflow

When contributing or updating the project:

```bash
# 1. Check status and ensure no .env or sensitive files are staged
git status

# 2. Stage changes
git add .

# 3. Commit with a conventional message
git commit -m "feat: complete deployment readiness and update README"

# 4. Push to your repository
git push origin main
```

---

## 26. Known Limitations & Future Improvements

- **WebSockets / Socket.io:** Currently, the queue updates on user interaction and mount; real-time push synchronization across multiple customer devices could be added using Socket.io.
- **Multi-Counter Support:** Support for assigning specific tokens to multiple physical counter windows (Counter 1, Counter 2).
- **Production Authentication:** Upgrading Practical 9's educational header authentication to bcrypt-hashed passwords and JWT cookies.
- **SMS/WhatsApp Notifications:** Integrating Twilio or WhatsApp Business API to alert customers when their token is next in line.

---

## 27. Author & Contributor Information

- **Project:** QueueFlow — Smart Queue Management System
- **Academic Context:** Full Stack Development (FSD) Practical Curriculum
- **Semester:** 5th Semester, Computer Engineering / IT
- **Contributor / Student Name:** `[Your Name Here]`
- **Enrollment Number:** `[Your Enrollment Number Here]`
- **College / University:** `[Your Institution Here]`
