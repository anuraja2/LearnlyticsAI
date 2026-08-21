import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const ExcelJS = require('./frontend/node_modules/exceljs');

async function generateSecurityReviewExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Learnlytics AI Security Architecture Engine';
  workbook.created = new Date();

  const filePath = path.join(process.cwd(), 'Security_Code_Review_Analysis_Report.xlsx');

  // Helper styles
  const navyHeader = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
  const grayHeader = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
  const fontWhiteBold = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };

  // ==========================================
  // SHEET 1: EXECUTIVE SUMMARY & SCORECARD
  // ==========================================
  const s1 = workbook.addWorksheet('📊 Executive Summary');
  s1.getColumn('A').width = 4;
  ['B', 'C', 'D', 'E', 'F', 'G'].forEach(c => s1.getColumn(c).width = 24);

  // Title Banner
  s1.mergeCells('B2:G3');
  const title = s1.getCell('B2');
  title.value = '🛡️ Learnlytics AI — Static Application Security Review (SAST)';
  title.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  title.fill = navyHeader;
  title.alignment = { vertical: 'middle', horizontal: 'center' };
  s1.getRow(2).height = 35;
  s1.getRow(3).height = 15;

  // Metadata Table
  const meta = [
    ['Application Name', 'Learnlytics AI / SafetyAI Backend API'],
    ['Technology Stack', 'Node.js (v20+), Express.js (v4.21), Supabase PostgreSQL, JWT, Multer, Tesseract.js'],
    ['Review Type', 'Static Application Security Testing (SAST) & Architecture Audit'],
    ['Review Date', new Date().toLocaleDateString()],
    ['Security Score', '78 / 100 (Grade: B+ | Solid Foundation with Remediable Critical Secrets)'],
    ['Overall Status', '⚠️ Remediations Recommended prior to Public Production Launch'],
  ];

  meta.forEach(([k, v], idx) => {
    const r = 5 + idx;
    s1.getCell(`B${r}`).value = k;
    s1.getCell(`B${r}`).font = { bold: true, color: { argb: '1E293B' } };
    s1.getCell(`C${r}`).value = v;
    s1.mergeCells(`C${r}:G${r}`);
    s1.getRow(r).height = 18;
  });

  // KPI Scorecard Cards
  const kpis = [
    { col: 'B', title: 'SECURITY SCORE', val: '78 / 100', color: '2563EB' },
    { col: 'C', title: 'CRITICAL FINDINGS', val: '1', color: 'DC2626' },
    { col: 'D', title: 'HIGH FINDINGS', val: '2', color: 'EA580C' },
    { col: 'E', title: 'MEDIUM FINDINGS', val: '3', color: 'F59E0B' },
    { col: 'F', title: 'LOW FINDINGS', val: '2', color: '10B981' },
    { col: 'G', title: 'CVE VULNERABILITIES', val: '0', color: '059669' },
  ];

  const kRow = 13;
  kpis.forEach(k => {
    const hCell = s1.getCell(`${k.col}${kRow}`);
    hCell.value = k.title;
    hCell.font = { bold: true, size: 9, color: { argb: 'FFFFFF' } };
    hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.color } };
    hCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const vCell = s1.getCell(`${k.col}${kRow + 1}`);
    vCell.value = k.val;
    vCell.font = { bold: true, size: 16, color: { argb: '0F172A' } };
    vCell.alignment = { horizontal: 'center', vertical: 'middle' };
    vCell.border = {
      bottom: { style: 'medium', color: { argb: k.color } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } },
    };
  });
  s1.getRow(kRow).height = 25;
  s1.getRow(kRow + 1).height = 30;

  // Findings Summary Table
  s1.getCell('B16').value = '📋 Security Findings Category Breakdown';
  s1.getCell('B16').font = { bold: true, size: 12, color: { argb: '1E293B' } };
  s1.getRow(17).values = ['', 'Security Domain', 'Total Issues', 'Critical', 'High', 'Medium', 'Low'];
  ['B', 'C', 'D', 'E', 'F', 'G'].forEach(c => {
    s1.getCell(`${c}17`).fill = grayHeader;
    s1.getCell(`${c}17`).font = fontWhiteBold;
    s1.getCell(`${c}17`).alignment = { horizontal: 'center' };
  });

  const domainSummary = [
    ['Authentication & Cryptography', 2, 1, 1, 0, 0],
    ['Authorization & Access Control', 1, 0, 1, 0, 0],
    ['Configuration & Security Headers', 2, 0, 0, 2, 0],
    ['Rate Limiting & Abuse Prevention', 1, 0, 0, 1, 0],
    ['Input Validation & Error Handling', 2, 0, 0, 0, 2],
    ['Third-Party Dependencies (CVEs)', 0, 0, 0, 0, 0],
  ];

  domainSummary.forEach((row, i) => {
    const r = s1.getRow(18 + i);
    r.values = ['', ...row];
    r.height = 20;
    if (i % 2 === 0) {
      ['B', 'C', 'D', 'E', 'F', 'G'].forEach(c => {
        s1.getCell(`${c}${18 + i}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      });
    }
  });

  // ==========================================
  // SHEET 2: BACKEND INVENTORY
  // ==========================================
  const s2 = workbook.addWorksheet('🏗️ Backend Inventory');
  s2.columns = [
    { header: 'Attribute / Component', key: 'attr', width: 30 },
    { header: 'Identified Technology / Configuration', key: 'tech', width: 45 },
    { header: 'Security Evaluation & Notes', key: 'eval', width: 55 },
  ];

  s2.getRow(1).font = fontWhiteBold;
  s2.getRow(1).height = 28;
  s2.getRow(1).eachCell(c => {
    c.fill = navyHeader;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const backendInventoryData = [
    { attr: 'Framework', tech: 'Express.js v4.21.2 (Node.js ESM)', eval: 'Modern lightweight REST framework. Well maintained.' },
    { attr: 'Programming Language', tech: 'JavaScript (Node.js ES6 Modules)', eval: 'Standard ES module imports (`import`/`export`).' },
    { attr: 'API Architecture', tech: 'RESTful JSON API with Express Router', eval: 'Centralized route handlers in `routes/api.js`.' },
    { attr: 'Authentication Mechanism', tech: 'Stateless JSON Web Tokens (jsonwebtoken v9.0.2)', eval: '24-hour expiry, signed with HMAC-SHA256.' },
    { attr: 'Password Hashing', tech: 'bcryptjs (v2.4.3) with 10 salt rounds', eval: 'Industry-standard adaptive hashing algorithm.' },
    { attr: 'Authorization Model', tech: 'Role-Based Access Control (`parent` vs `child`)', eval: 'Enforced via `authenticateToken` middleware and route checks.' },
    { attr: 'Database Engine', tech: 'Supabase PostgreSQL (v15+) Cloud Database', eval: 'Hosted PostgreSQL with foreign keys and cascade deletions.' },
    { attr: 'Database Client / ORM', tech: '@supabase/supabase-js (v2.45.4)', eval: 'Parameterized query builder preventing SQL injection.' },
    { attr: 'File Upload Functionality', tech: 'Multer (v1.4.5-lts.1) Disk Storage', eval: '10MB limit, mimetype filtering, unique filename hashing.' },
    { attr: 'Document & OCR Processing', tech: 'pdf-parse (v2.4.5) & Tesseract.js (v7.0.0)', eval: 'Local file parsing & optical character recognition.' },
    { attr: 'Session Handling', tech: 'Stateless JWT in HTTP Authorization Header', eval: 'Client stores token in localStorage and attaches Bearer header.' },
    { attr: 'CORS Policy', tech: 'Express cors package with localhost regex', eval: 'Custom regex matches local development ports.' },
    { attr: 'Environment Config', tech: 'dotenv (v16.4.7)', eval: 'Loads variables from backend/.env file.' },
  ];

  backendInventoryData.forEach((row, i) => {
    const r = s2.addRow(row);
    r.height = 22;
    if (i % 2 === 0) {
      r.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } });
    }
  });

  // ==========================================
  // SHEET 3: API ENDPOINT INVENTORY
  // ==========================================
  const s3 = workbook.addWorksheet('🔌 API Endpoint Inventory');
  s3.columns = [
    { header: 'Endpoint', key: 'endpoint', width: 28 },
    { header: 'HTTP Method', key: 'method', width: 14 },
    { header: 'Auth Required', key: 'auth', width: 15 },
    { header: 'Allowed Roles', key: 'roles', width: 16 },
    { header: 'Controller / File Path', key: 'file', width: 32 },
    { header: 'Description / Security Scope', key: 'desc', width: 45 },
  ];

  s3.getRow(1).font = fontWhiteBold;
  s3.getRow(1).height = 28;
  s3.getRow(1).eachCell(c => {
    c.fill = navyHeader;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const apiEndpoints = [
    { endpoint: '/api/health', method: 'GET', auth: 'No (Public)', roles: 'All / Anonymous', file: 'backend/server.js', desc: 'Database connection & service status health check' },
    { endpoint: '/api/auth/register', method: 'POST', auth: 'No (Public)', roles: 'All / Anonymous', file: 'backend/routes/api.js:71', desc: 'User registration for parent or child' },
    { endpoint: '/api/auth/login', method: 'POST', auth: 'No (Public)', roles: 'All / Anonymous', file: 'backend/routes/api.js:369', desc: 'User authentication & JWT token issuance' },
    { endpoint: '/api/students', method: 'GET', auth: 'Yes (JWT)', roles: 'Parent, Child', file: 'backend/routes/api.js:457', desc: 'Fetch student profiles belonging to parent' },
    { endpoint: '/api/students', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent only', file: 'backend/routes/api.js:481', desc: 'Add new student profile under parent' },
    { endpoint: '/api/reports/upload', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent only', file: 'backend/routes/api.js:548', desc: 'Upload academic report card & run AI analysis' },
    { endpoint: '/api/reports', method: 'GET', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:702', desc: 'Get saved academic reports & AI assessments' },
    { endpoint: '/api/quiz/questions', method: 'GET', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:748', desc: 'Fetch quiz question bank filtered by subject' },
    { endpoint: '/api/quiz/attempts', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:818', desc: 'Record quiz attempt and update learning progress' },
    { endpoint: '/api/quiz/attempts', method: 'GET', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:928', desc: 'Retrieve child quiz attempt history' },
    { endpoint: '/api/progress', method: 'GET', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:957', desc: 'Retrieve aggregated learning progress metrics' },
    { endpoint: '/api/safety/screen-time', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:988', desc: 'Update daily/continuous screen time usage' },
    { endpoint: '/api/safety/emotion', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:1055', desc: 'Log emotional well-being check' },
    { endpoint: '/api/safety/unsafe-word', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:1095', desc: 'Log digital safety moderation warning' },
    { endpoint: '/api/safety/sos', method: 'POST', auth: 'Yes (JWT)', roles: 'Parent, Child (Owned)', file: 'backend/routes/api.js:1135', desc: 'Trigger emergency SOS alert notification' },
    { endpoint: '/api/notifications', method: 'GET', auth: 'Yes (JWT)', roles: 'Parent only', file: 'backend/routes/api.js:1177', desc: 'Get list of parent notifications' },
    { endpoint: '/api/notifications/mark-read', method: 'PUT', auth: 'Yes (JWT)', roles: 'Parent only', file: 'backend/routes/api.js:1192', desc: 'Mark all parent notifications as read' },
  ];

  apiEndpoints.forEach((item, i) => {
    const r = s3.addRow(item);
    r.height = 20;
    const methodCell = r.getCell('method');
    if (item.method === 'GET') methodCell.font = { color: { argb: '166534' }, bold: true };
    else if (item.method === 'POST') methodCell.font = { color: { argb: '1E40AF' }, bold: true };
    else if (item.method === 'PUT') methodCell.font = { color: { argb: '9A3412' }, bold: true };

    const authCell = r.getCell('auth');
    if (item.auth.includes('No')) authCell.font = { color: { argb: 'DC2626' }, bold: true };
    else authCell.font = { color: { argb: '166534' } };

    if (i % 2 === 0) {
      r.eachCell(c => {
        if (!c.fill || !c.fill.fgColor) {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
        }
      });
    }
  });

  // ==========================================
  // SHEET 4: SECURITY FINDINGS (SAST)
  // ==========================================
  const s4 = workbook.addWorksheet('🚨 Security Findings');
  s4.columns = [
    { header: 'Finding ID', key: 'id', width: 14 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Category', key: 'cat', width: 22 },
    { header: 'Vulnerability Title', key: 'title', width: 35 },
    { header: 'File Path & Line', key: 'location', width: 32 },
    { header: 'Security Risk & Impact', key: 'risk', width: 50 },
    { header: 'Remediation Recommendation', key: 'fix', width: 55 },
  ];

  s4.getRow(1).font = fontWhiteBold;
  s4.getRow(1).height = 28;
  s4.getRow(1).eachCell(c => {
    c.fill = navyHeader;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const findings = [
    {
      id: 'SEC-001',
      severity: 'CRITICAL',
      cat: 'Cryptography / Secrets',
      title: 'Hardcoded Static JWT Secret Key',
      location: 'backend/routes/api.js:16',
      risk: 'JWT signing secret `learnlytics-secret-key-12345` is hardcoded. An attacker can forge JWT tokens with arbitrary user IDs/roles and take over parent or child accounts.',
      fix: 'Load secret from `process.env.JWT_SECRET`. Enforce server crash on startup if unset or shorter than 32 characters in production.',
    },
    {
      id: 'SEC-002',
      severity: 'HIGH',
      cat: 'Access Control / IDOR',
      title: 'Unauthenticated Public File Serving of Student Reports',
      location: 'backend/server.js:24',
      risk: '`app.use("/uploads", express.static(...))` serves academic reports publicly. Anyone with the file URL can access student PII, grades, and report card images without authentication.',
      fix: 'Remove public static `/uploads` route. Implement an authenticated download endpoint `GET /api/reports/:id/file` that validates parent/child ownership before streaming with `res.sendFile()`.',
    },
    {
      id: 'SEC-003',
      severity: 'HIGH',
      cat: 'Authentication / Seed Data',
      title: 'Automatic Seeding of Default Accounts on Startup',
      location: 'backend/routes/api.js:1295',
      risk: '`seedTestAccounts()` creates `parent@test.com` and `child@test.com` with static password `password123` on every startup. If deployed to production, default accounts remain accessible.',
      fix: 'Gate `seedTestAccounts()` with `if (process.env.NODE_ENV !== "production" && process.env.ENABLE_TEST_SEED === "true")`.',
    },
    {
      id: 'SEC-004',
      severity: 'MEDIUM',
      cat: 'Configuration / Headers',
      title: 'Missing HTTP Security Headers (Helmet / CSP)',
      location: 'backend/server.js:8-25',
      risk: 'Express server lacks standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `HSTS`), exposing clients to clickjacking and MIME sniffing.',
      fix: 'Install `helmet` package and apply `app.use(helmet());` in `server.js`.',
    },
    {
      id: 'SEC-005',
      severity: 'MEDIUM',
      cat: 'Abuse Prevention',
      title: 'Missing Rate Limiting on Authentication Endpoints',
      location: 'backend/routes/api.js:71,369',
      risk: 'Login and signup endpoints have no request throttling, allowing automated brute-force password guessing and credential stuffing attacks.',
      fix: 'Add `express-rate-limit` middleware on `/api/auth/*` restricting to max 5 failed attempts per 15-minute window.',
    },
    {
      id: 'SEC-006',
      severity: 'MEDIUM',
      cat: 'Authorization / RLS Bypass',
      title: 'Service Role Key Bypasses Row Level Security',
      location: 'backend/lib/supabase.js:14',
      risk: 'Backend uses `SUPABASE_SERVICE_KEY` exclusively, bypassing Supabase PostgreSQL RLS policies. Any query missing manual tenant filters leaks data across users.',
      fix: 'Maintain strict manual ownership verification (`eq("parent_id", req.user.id)`) on every route as defense-in-depth, or use user-scoped tokens where applicable.',
    },
    {
      id: 'SEC-007',
      severity: 'LOW',
      cat: 'Error Handling',
      title: 'Internal Database Error Stack Leakage in Catch Blocks',
      location: 'backend/routes/api.js (multiple lines)',
      risk: '`res.status(500).json({ error: err.message })` exposes internal PostgreSQL constraint names and table schemas directly to the client.',
      fix: 'Log errors internally with a logger like Pino or Winston, and return sanitized generic error messages in production mode.',
    },
    {
      id: 'SEC-008',
      severity: 'LOW',
      cat: 'Input Validation / File Upload',
      title: 'MIME Type Checked via Client Header Only (No Magic Bytes)',
      location: 'backend/routes/api.js:36-42',
      risk: 'Multer `fileFilter` trusts `file.mimetype` sent by the client browser without validating binary magic numbers.',
      fix: 'Integrate `file-type` to verify file header magic bytes upon upload before passing to OCR or PDF parser.',
    },
  ];

  const sevColors = {
    CRITICAL: { bg: 'FEE2E2', fg: '991B1B' },
    HIGH: { bg: 'FFEDD5', fg: '9A3412' },
    MEDIUM: { bg: 'FEF3C7', fg: '92400E' },
    LOW: { bg: 'DCFCE7', fg: '166534' },
  };

  findings.forEach((item, idx) => {
    const row = s4.addRow(item);
    row.height = 28;
    const sevCell = row.getCell('severity');
    const color = sevColors[item.severity] || { bg: 'F1F5F9', fg: '334155' };
    sevCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.bg } };
    sevCell.font = { bold: true, color: { argb: color.fg } };
    sevCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (idx % 2 === 0) {
      ['id', 'cat', 'title', 'location', 'risk', 'fix'].forEach(k => {
        row.getCell(k).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      });
    }
  });

  // ==========================================
  // SHEET 5: DEPENDENCY AUDIT
  // ==========================================
  const s5 = workbook.addWorksheet('📦 Dependency Audit');
  s5.columns = [
    { header: 'Package Name', key: 'pkg', width: 26 },
    { header: 'Version in Lockfile', key: 'ver', width: 18 },
    { header: 'License', key: 'lic', width: 14 },
    { header: 'Known Vulnerabilities', key: 'cve', width: 22 },
    { header: 'Security Assessment', key: 'status', width: 45 },
  ];

  s5.getRow(1).font = fontWhiteBold;
  s5.getRow(1).height = 28;
  s5.getRow(1).eachCell(c => {
    c.fill = navyHeader;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const depAudit = [
    { pkg: '@supabase/supabase-js', ver: '^2.45.4 (2.45.4)', lic: 'MIT', cve: '0 Known CVEs', status: '✅ Actively maintained, secure PostgreSQL client' },
    { pkg: 'bcryptjs', ver: '^2.4.3 (2.4.3)', lic: 'MIT', cve: '0 Known CVEs', status: '✅ Secure pure JS bcrypt implementation' },
    { pkg: 'cors', ver: '^2.8.5 (2.8.5)', lic: 'MIT', cve: '0 Known CVEs', status: '✅ Standard CORS middleware' },
    { pkg: 'dotenv', ver: '^16.4.7 (16.4.7)', lic: 'BSD-2-Clause', cve: '0 Known CVEs', status: '✅ Up-to-date environment variable loader' },
    { pkg: 'express', ver: '^4.21.2 (4.21.2)', lic: 'MIT', cve: '0 Known CVEs', status: '✅ Latest stable v4 release' },
    { pkg: 'jsonwebtoken', ver: '^9.0.2 (9.0.2)', lic: 'MIT', cve: '0 Known CVEs', status: '✅ Robust JWT library; requires strong secret' },
    { pkg: 'multer', ver: '^1.4.5-lts.1', lic: 'MIT', cve: '0 Known CVEs', status: '✅ LTS version for multipart form data' },
    { pkg: 'pdf-parse', ver: '^2.4.5 (2.4.5)', lic: 'MIT', cve: '0 Known CVEs', status: '✅ Local PDF text extraction' },
    { pkg: 'tesseract.js', ver: '^7.0.0 (7.0.0)', lic: 'Apache-2.0', cve: '0 Known CVEs', status: '✅ Modern OCR engine running in WebAssembly' },
  ];

  depAudit.forEach((d, i) => {
    const r = s5.addRow(d);
    r.height = 20;
    const cveCell = r.getCell('cve');
    cveCell.font = { color: { argb: '15803D' }, bold: true };
    if (i % 2 === 0) {
      r.eachCell(c => {
        if (!c.fill || !c.fill.fgColor) {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
        }
      });
    }
  });

  // ==========================================
  // SHEET 6: REMEDIATION ROADMAP
  // ==========================================
  const s6 = workbook.addWorksheet('🛠️ Remediation Roadmap');
  s6.columns = [
    { header: 'Priority', key: 'prio', width: 14 },
    { header: 'Target Finding', key: 'finding', width: 15 },
    { header: 'Action Item', key: 'action', width: 35 },
    { header: 'Implementation Details', key: 'details', width: 55 },
    { header: 'Estimated Effort', key: 'effort', width: 16 },
  ];

  s6.getRow(1).font = fontWhiteBold;
  s6.getRow(1).height = 28;
  s6.getRow(1).eachCell(c => {
    c.fill = navyHeader;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const roadmap = [
    { prio: 'P0 - Urgent', finding: 'SEC-001', action: 'Move JWT Secret to .env', details: 'Replace hardcoded string with `process.env.JWT_SECRET`. Add startup validation.', effort: '15 mins' },
    { prio: 'P0 - Urgent', finding: 'SEC-002', action: 'Protect Uploaded Reports', details: 'Remove `app.use("/uploads", express.static(...))` and replace with authenticated streaming endpoint.', effort: '45 mins' },
    { prio: 'P1 - High', finding: 'SEC-003', action: 'Disable Auto-Seeding in Production', details: 'Gate `seedTestAccounts()` behind `NODE_ENV !== "production"`.', effort: '10 mins' },
    { prio: 'P1 - High', finding: 'SEC-004', action: 'Install & Configure Helmet', details: 'Run `npm i helmet` in backend and add `app.use(helmet())` in `server.js`.', effort: '15 mins' },
    { prio: 'P1 - High', finding: 'SEC-005', action: 'Add Rate Limiting on Auth', details: 'Install `express-rate-limit` and throttle `/api/auth/login` and `/api/auth/register`.', effort: '30 mins' },
    { prio: 'P2 - Medium', finding: 'SEC-007', action: 'Sanitize 500 Error Responses', details: 'Create centralized error handling middleware to avoid leaking database schema details.', effort: '30 mins' },
    { prio: 'P2 - Medium', finding: 'SEC-008', action: 'Magic Byte File Validation', details: 'Inspect first bytes of uploaded files to ensure real PDF/PNG/JPEG binaries.', effort: '45 mins' },
  ];

  const prioColors = {
    'P0 - Urgent': { bg: 'FEE2E2', fg: '991B1B' },
    'P1 - High': { bg: 'FFEDD5', fg: '9A3412' },
    'P2 - Medium': { bg: 'FEF3C7', fg: '92400E' },
  };

  roadmap.forEach((item, idx) => {
    const row = s6.addRow(item);
    row.height = 24;
    const prioCell = row.getCell('prio');
    const color = prioColors[item.prio] || { bg: 'F1F5F9', fg: '334155' };
    prioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.bg } };
    prioCell.font = { bold: true, color: { argb: color.fg } };
    prioCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (idx % 2 === 0) {
      ['finding', 'action', 'details', 'effort'].forEach(k => {
        row.getCell(k).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      });
    }
  });

  // Write Excel File
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n======================================================`);
  console.log(`📊 Security Code Review Excel Report Generated!`);
  console.log(`📍 Saved at: ${filePath}`);
  console.log(`======================================================\n`);
  return filePath;
}

generateSecurityReviewExcel().catch(err => {
  console.error('Error generating Excel report:', err);
  process.exit(1);
});
