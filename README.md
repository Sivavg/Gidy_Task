# System Audit Logs Dashboard

## 1. Setup Instructions

### Backend
```bash
cd server
npm install
node server.js
```
*(Note: MongoDB connection is pre-configured with the provided Atlas URI)*

### Frontend
```bash
cd client
npm install
npm run dev
```

## 2. Technical Decisions

### Backend (Node.js, Express, MongoDB)
- **Bulk Upload Capability**: Built a `/api/logs/bulk` endpoint capable of processing 10,000 logs in a single request. Increased the `express.json` limit to `50mb` to safely handle large JSON payloads.
- **Server-Side Data Processing**: Implemented server-side logic for searching (Regex across multiple text fields), filtering (by Severity and Role), sorting, and pagination (`skip` and `limit`).
- **Database Optimization**: Added Mongoose schema indexes on heavily queried fields (`actor`, `role`, `action`, `severity`, `status`, `timestamp`) to ensure database lookups remain extremely fast when dealing with 10,000+ records.

### Frontend (React, Vite)
- **Enterprise UI Design**: Designed a clean, professional interface (light theme) using custom CSS. The layout prioritizes readability and standard enterprise SaaS patterns (clean tables, proper typography, status badges).
- **Debounced Search**: Added a 500ms debounce function to the search bar. This prevents overloading the backend with API requests on every keystroke.
- **One-Click Mock Generator**: Added a button to the dashboard header that instantly generates 10,000 structured log entries and tests the bulk-upload API in a single click.
