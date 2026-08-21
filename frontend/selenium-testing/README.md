# SmartChild AI - Selenium Web Application Testing Suite & Excel Analysis Reporter (Node.js)

This dedicated directory contains the complete **Selenium WebDriver End-to-End Web Application Automated Testing Suite** for testing **SmartChild AI** in web browsers (Chrome, Edge, Firefox) using Node.js.

It automatically generates a styled **Excel Analysis Report (`.xlsx`)** summarizing test results, pass rates, durations, feature breakdowns, and failure tracebacks.

---

## 📁 Directory Architecture

```
selenium-testing/
├── config/
│   └── browser.config.js     # Selenium WebDriver Options (Chrome/Edge/Firefox, Headless mode)
├── pages/                    # Page Object Model (POM) Locators & Interactions
│   ├── BasePage.js           # Selenium WebDriver Wrapper Methods
│   ├── LoginPage.js          # Authentication & Role Routing
│   ├── ChildDashboardPage.js # Missions, Timers & Learning Hub Cards
│   ├── ParentDashboardPage.js# Safety Dashboard & Metrics
│   └── SosPage.js            # Emergency SOS Button, Location Toggle & Modal
├── tests/                    # Selenium Mocha & Chai Test Specs
│   └── 01_auth.test.js
├── utils/
│   └── excelReporter.js      # Styled Excel Report Generator (ExcelJS)
├── reports/                  # Generated Excel (.xlsx) Reports Output Folder
├── runner.js                 # Master Selenium Test Execution & Excel Generator Script
├── package.json
└── README.md
```

---

## 📊 Generated Excel Report Features

Each test execution automatically produces a formatted `.xlsx` file in `selenium-testing/reports/` with 2 worksheets:

1. **Web Execution Summary Sheet**:
   - Total Tests, Passed, Failed, Skipped KPI cards with status styling.
   - Pass Rate Percentage (`%`).
   - Web Feature-wise breakdown table (Authentication, Child Dashboard, AI Chatbot Tutor, Quiz Generator, Parent Dashboard, Comprehensive Analytics Hub, AI Recommendations Engine, Emergency SOS, Story Learning).
   - Execution timestamps and browser metadata.

2. **Detailed Test Results Sheet**:
   - Test ID (`TC-WEB-001`, `TC-WEB-002`, etc.)
   - Feature Module
   - Description & Step Details
   - Color-Coded Status (**PASS** in Green, **FAIL** in Red)
   - Duration in Milliseconds
   - Error Stack Trace & Failure Messages (if applicable)

---

## 🚀 How to Run the Selenium Web Tests

### 1. Start the SmartChild AI Web Server
Ensure your Vite dev server is running on `http://localhost:5173`:
```bash
npm run dev
```

### 2. Execute Selenium Web Tests & Generate Excel Report
From the main project directory, run:
```bash
node selenium-testing/runner.js
```

Or from inside `selenium-testing/`:
```bash
cd selenium-testing
npm test
```

---

## 🔧 Environment Variables & Headless Mode

| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_URL` | Target Web Application URL | `http://localhost:5173` |
| `HEADLESS` | Run in Headless Chrome Mode (`true`/`false`) | `false` |

Example running in Headless Chrome:
```bash
HEADLESS=true node selenium-testing/runner.js
```
