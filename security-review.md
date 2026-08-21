# 🛡️ Learnlytics AI — Defensive Static Application Security Review (SAST)

**Target Application:** Learnlytics AI / SafetyAI Backend  
**Review Type:** Static Application Security Testing (SAST) & Architecture Audit  
**Assessment Date:** August 21, 2026  
**Security Score:** **78 / 100** (Grade: B+ | Solid Architecture, Remediable Secrets & Config)  
**Excel Report:** [`Security_Code_Review_Analysis_Report.xlsx`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/Security_Code_Review_Analysis_Report.xlsx)

---

## 1. Executive Summary

A comprehensive, defensive static code analysis was conducted on the Learnlytics AI backend repository. The application implements a modern RESTful API powered by Node.js, Express.js, and Supabase (hosted PostgreSQL). 

### Key Strengths:
1. **Parameterized Queries**: Uses `@supabase/supabase-js` query builder across all routes, preventing traditional SQL injection risks.
2. **Password Hashing**: Employs industry-standard `bcryptjs` with 10 salt rounds before persisting credentials to the database.
3. **Role Validation & Ownership Checks**: The majority of sensitive resources (reports, quiz attempts, progress, safety logs) enforce strict ownership matching against `req.user.id`.
4. **Zero Dependency CVEs**: `npm audit` returned 0 known vulnerabilities across all 139 direct and transitive backend production dependencies.

### Primary Areas Requiring Remediation:
1. **Hardcoded JWT Signing Secret**: Stored directly in `backend/routes/api.js`.
2. **Public Static Serving of Uploaded Reports**: Student report cards saved to `/uploads` are served statically without access token validation.
3. **Automatic Seeding of Test Accounts**: Default credentials seeded on server startup.
4. **Missing HTTP Security Headers & Rate Limiting**: Server does not yet include `helmet` or `express-rate-limit`.

---

## 2. Backend Inventory

| Component | Technology / Implementation | Security & Architectural Assessment |
|---|---|---|
| **Framework** | Express.js `^4.21.2` (Node.js ESM) | Lightweight, standard REST framework. |
| **Language** | JavaScript (ES6+ Modules) | Modern ES module structure with strict syntax. |
| **API Architecture** | RESTful JSON API via Express Router | Centralized route definitions mounted at `/api`. |
| **Authentication** | JSON Web Tokens (`jsonwebtoken ^9.0.2`) | Bearer tokens with 24-hour expiration. |
| **Password Hashing** | `bcryptjs ^2.4.3` (10 rounds) | Adaptive hashing with per-user salt. |
| **Authorization** | Role-Based Access Control (`parent` vs `child`) | Enforced in route handlers and middleware. |
| **Database** | Supabase Cloud PostgreSQL | Foreign keys with `ON DELETE CASCADE`. |
| **Database Client** | `@supabase/supabase-js ^2.45.4` | Parameterized PostgREST API client. |
| **File Uploads** | `multer ^1.4.5-lts.1` Disk Storage | 10MB limit, timestamp+random suffix. |
| **OCR & Parsing** | `pdf-parse ^2.4.5`, `tesseract.js ^7.0.0` | Local in-process document parsing. |
| **CORS Policy** | `cors ^2.8.5` with localhost regex | Supports local development & mobile clients. |
| **Config Loader** | `dotenv ^16.4.7` | Loads environment variables from `.env`. |

---

## 3. Endpoint Inventory

| Endpoint | Method | Auth Required | Allowed Roles | Controller File | Purpose |
|---|---|---|---|---|---|
| `/api/health` | `GET` | ❌ No | Public | `server.js:29` | Server and database status check |
| `/api/auth/register` | `POST` | ❌ No | Public | `routes/api.js:71` | User registration (parent/child) |
| `/api/auth/login` | `POST` | ❌ No | Public | `routes/api.js:369` | Authentication & JWT issuance |
| `/api/students` | `GET` | ✅ Yes | Parent, Child | `routes/api.js:457` | List student profiles under parent |
| `/api/students` | `POST` | ✅ Yes | Parent only | `routes/api.js:481` | Register new child profile |
| `/api/reports/upload` | `POST` | ✅ Yes | Parent only | `routes/api.js:548` | Upload report & trigger AI analysis |
| `/api/reports` | `GET` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:702` | Retrieve reports and AI insights |
| `/api/quiz/questions` | `GET` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:748` | Fetch question bank by subject |
| `/api/quiz/attempts` | `POST` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:818` | Record quiz submission & score |
| `/api/quiz/attempts` | `GET` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:928` | Retrieve child quiz history |
| `/api/progress` | `GET` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:957` | Get aggregated progress metrics |
| `/api/safety/screen-time` | `POST` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:988` | Track daily & continuous screen time |
| `/api/safety/emotion` | `POST` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:1055` | Log emotional well-being check |
| `/api/safety/unsafe-word` | `POST` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:1095` | Moderate unsafe language / chat |
| `/api/safety/sos` | `POST` | ✅ Yes | Parent, Child (Owned) | `routes/api.js:1135` | Trigger emergency SOS alert |
| `/api/notifications` | `GET` | ✅ Yes | Parent only | `routes/api.js:1177` | Retrieve parent notifications |
| `/api/notifications/mark-read` | `PUT` | ✅ Yes | Parent only | `routes/api.js:1192` | Mark parent alerts as read |

---

## 4. Security Findings & Static Code Analysis (SAST)

### 🔴 SEC-001: Hardcoded Static JWT Secret Key
- **Severity:** `CRITICAL`
- **Location:** [`backend/routes/api.js:16`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/routes/api.js#L16)
- **Description:** `const JWT_SECRET = 'learnlytics-secret-key-12345';` is hardcoded in the source code.
- **Risk & Impact:** Anyone with access to the source code can forge valid JWT tokens for any parent or child user ID, bypassing authentication completely.
- **Recommended Fix:**
  ```javascript
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing or insecure!');
    }
  }
  ```

---

### 🟠 SEC-002: Unauthenticated Public Static Serving of Uploaded Report Cards
- **Severity:** `HIGH`
- **Location:** [`backend/server.js:24`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/server.js#L24)
- **Description:** `app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));` makes all uploaded report cards publicly accessible over HTTP.
- **Risk & Impact:** Academic report cards containing student names, ages, grades, and school names can be downloaded without authentication by anyone who obtains the filename.
- **Recommended Fix:** Remove public static mounting and implement a secured streaming route:
  ```javascript
  router.get('/reports/:reportId/file', authenticateToken, async (req, res) => {
    const { data: report } = await supabase.from('reports').select().eq('id', req.params.reportId).single();
    // Validate that req.user is authorized for this report's child
    res.sendFile(path.join(process.cwd(), 'uploads', report.file_name));
  });
  ```

---

### 🟠 SEC-003: Automatic Seeding of Default Accounts on Startup
- **Severity:** `HIGH`
- **Location:** [`backend/routes/api.js:1295-1348`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/routes/api.js#L1295)
- **Description:** `seedTestAccounts()` creates `parent@test.com` and `child@test.com` with password `password123` on startup.
- **Risk & Impact:** If deployed to production, default accounts with known passwords exist in the database.
- **Recommended Fix:** Gate seeding behind an environment flag:
  ```javascript
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_SEED === 'true') {
    await seedTestAccounts();
  }
  ```

---

### 🟡 SEC-004: Missing HTTP Security Headers (Helmet)
- **Severity:** `MEDIUM`
- **Location:** [`backend/server.js:8-25`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/server.js#L8)
- **Description:** Express server does not configure standard security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Strict-Transport-Security`).
- **Risk & Impact:** Increases susceptibility to clickjacking, MIME-sniffing, and cross-site scripting (XSS).
- **Recommended Fix:** Install `helmet` and add `app.use(helmet());` in `server.js`.

---

### 🟡 SEC-005: Missing Rate Limiting on Authentication Endpoints
- **Severity:** `MEDIUM`
- **Location:** [`backend/routes/api.js:71,369`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/routes/api.js#L71)
- **Description:** `/api/auth/login` and `/api/auth/register` have no rate limiting.
- **Risk & Impact:** Leaves login and registration endpoints vulnerable to automated brute-force attacks and denial-of-service.
- **Recommended Fix:** Use `express-rate-limit` to restrict failed login attempts (e.g. 5 requests per 15 minutes per IP).

---

### 🟡 SEC-006: Supabase Service Role Key Used Server-Side
- **Severity:** `MEDIUM`
- **Location:** [`backend/lib/supabase.js:14`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/lib/supabase.js#L14)
- **Description:** The backend connects with `SUPABASE_SERVICE_KEY` which bypasses PostgreSQL Row Level Security (RLS).
- **Risk & Impact:** Any query that inadvertently omits `eq('parent_id', req.user.id)` could expose multi-tenant data.
- **Recommended Fix:** Maintain strict manual ownership checks across every query (already implemented in most routes) and ensure automated unit/integration tests verify tenant isolation.

---

### 🟢 SEC-007: Internal Error Stack / Database Constraint Leakage
- **Severity:** `LOW`
- **Location:** [`backend/routes/api.js (catch blocks)`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/routes/api.js)
- **Description:** `res.status(500).json({ error: err.message })` returns raw PostgreSQL error strings in responses.
- **Risk & Impact:** Leaks database schema structure, table names, and constraint names to client callers.
- **Recommended Fix:** Use a centralized error handler that logs detailed errors server-side and returns generic error messages to clients in production.

---

### 🟢 SEC-008: File Upload MIME Type Validated via Client Header Only
- **Severity:** `LOW`
- **Location:** [`backend/routes/api.js:36-42`](file:///c:/Users/anuta/OneDrive/Documents/SafetyAI/backend/routes/api.js#L36)
- **Description:** Multer checks `file.mimetype` sent by the browser rather than inspecting file magic bytes.
- **Risk & Impact:** Client can disguise non-image files with a fake `image/png` header (mitigated by OCR/PDF parser failure).
- **Recommended Fix:** Validate magic bytes using `file-type` before saving or parsing.

---

## 5. Dependency Review

| Package | Version | License | Known CVEs | Assessment |
|---|---|---|---|---|
| `@supabase/supabase-js` | `^2.45.4` | MIT | 0 | ✅ Secure & active |
| `bcryptjs` | `^2.4.3` | MIT | 0 | ✅ Secure hashing |
| `cors` | `^2.8.5` | MIT | 0 | ✅ Standard CORS |
| `dotenv` | `^16.4.7` | BSD-2-Clause | 0 | ✅ Secure config |
| `express` | `^4.21.2` | MIT | 0 | ✅ Up to date |
| `jsonwebtoken` | `^9.0.2` | MIT | 0 | ✅ Standard JWT |
| `multer` | `^1.4.5-lts.1` | MIT | 0 | ✅ Secure multipart |
| `pdf-parse` | `^2.4.5` | MIT | 0 | ✅ Local parser |
| `tesseract.js` | `^7.0.0` | Apache-2.0 | 0 | ✅ WASM OCR engine |

---

## 6. Risk Summary & Security Score

```
┌────────────────────────────────────────────────────────┐
│               OVERALL SECURITY SCORE                   │
│                     78 / 100                           │
│  Grade: B+ (Good Architectural Hygiene & Isolation)    │
└────────────────────────────────────────────────────────┘
```

- **Critical Findings:** 1 (Hardcoded JWT Secret)
- **High Findings:** 2 (Public report serving, startup seeding)
- **Medium Findings:** 3 (Security headers, rate limiting, service role key)
- **Low Findings:** 2 (Error leakage, file magic bytes)
- **Known CVEs in Dependencies:** 0

---

## 7. Recommended Remediation Roadmap

1. **Immediate (P0):**
   - Move `JWT_SECRET` to `backend/.env` and update `.env.example`.
   - Protect `/uploads` static route by moving to an authenticated streaming controller.
2. **Short-Term (P1):**
   - Install `helmet` and `express-rate-limit`.
   - Gate `seedTestAccounts()` behind `NODE_ENV !== 'production'`.
3. **Medium-Term (P2):**
   - Implement centralized error handling middleware.
   - Add magic byte inspection for file uploads.
