# SafetyAI (Learnlytics AI)

> **AI-Powered Smart Learning & Digital Safety for Children**

SafetyAI is structured into separate **Frontend** and **Backend** applications.

---

## 📁 Project Structure

```text
SafetyAI/
├── frontend/             # React 19 + Vite Frontend UI
│   ├── src/              # Components, Pages, Assets & Services
│   ├── public/           # Static Public Assets
│   ├── index.html        # Main Entry HTML
│   ├── vite.config.js    # Vite Configuration
│   └── package.json      # Frontend Dependencies & Scripts
│
├── backend/              # Node.js + Express REST API Server
│   ├── server.js         # Express Server Entry Point
│   ├── routes/           # REST API Route Controllers
│   ├── models/           # Mongoose Data Models
│   ├── services/         # Backend Services
│   └── package.json      # Backend Dependencies & Scripts
│
└── package.json          # Root Monorepo Orchestration Scripts
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or navigate into `frontend` and `backend` separately and run `npm install`)*

### 2. Start the Frontend
Run from the root directory:
```bash
npm run dev:frontend
```
Or inside `frontend/`:
```bash
cd frontend
npm run dev
```
*(Default URL: `http://localhost:5173`)*

### 3. Start the Backend API Server
Run from the root directory:
```bash
npm run dev:backend
```
Or inside `backend/`:
```bash
cd backend
npm run dev
```
*(Default URL: `http://localhost:5000`)*

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework**: React.js 19 + Vite
- **Styling**: Modern Glassmorphism CSS & Responsive UI
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charts**: Recharts

### Backend (`/backend`)
- **Runtime**: Node.js & Express.js REST APIs
- **Database**: MongoDB & Mongoose ODM
- **File Upload**: Multer
- **API Base**: `http://localhost:5000/api`
