# SmartChild AI - Appium Mobile Automated Testing Suite & Excel Analysis Reporter

This dedicated directory contains the complete **Appium End-to-End Automated Mobile Testing Suite** for testing the **SmartChild AI** Android Mobile Application across all features.

It automatically generates a styled **Excel Analysis Report (`.xlsx`)** summarizing test results, pass rates, durations, feature breakdowns, and failure tracebacks.

---

## 📁 Directory Architecture

```
appium-testing/
├── config/
│   └── capabilities.js       # Appium Android Capabilities (Chrome, Webview, Native APK)
├── pages/                    # Page Object Model (POM) Locators & Interactions
│   ├── BasePage.js
│   ├── AuthPage.js           # Login & Signup Screens
│   ├── ChildDashboardPage.js # Missions, Timers, Navigation
│   ├── AiTutorPage.js        # AI Chatbot & Subject Selectors
│   ├── QuizPage.js           # Quiz Generator Engine & Feedback
│   ├── ParentDashboardPage.js# Safety Dashboard & Metrics
│   ├── SosPage.js            # One-Tap Emergency SOS & Contacts
│   ├── AnalyticsPage.js      # Recharts Analytics & Visualizations
│   └── StoryPage.js          # Story Library & Audio Player
├── tests/                    # Appium Mocha & Chai Test Suites
│   ├── 01_auth.test.js
│   ├── 02_child_learning.test.js
│   ├── 03_parent_monitoring.test.js
│   └── 04_emergency_sos.test.js
├── utils/
│   └── excelReporter.js      # Styled Excel Report Generator (ExcelJS)
├── reports/                  # Generated Excel (.xlsx) Reports Output Folder
├── runner.js                 # Master Test Execution & Excel Generator Script
├── package.json
└── README.md
```

---

## 📊 Generated Excel Report Features

Each test execution automatically produces a formatted `.xlsx` file in `appium-testing/reports/` with 2 worksheets:

1. **Executive Summary Dashboard**:
   - Total Tests, Passed, Failed, Skipped KPI cards with status styling.
   - Pass Rate Percentage (`%`).
   - Feature-wise breakdown table (Authentication, Child Dashboard, AI Tutor, Quiz Generator, Parent Dashboard, Emergency SOS, Analytics Hub).
   - Execution timestamps and metadata.

2. **Detailed Test Results Sheet**:
   - Test Case ID (`TC-AUTH-001`, `TC-CHILD-001`, etc.)
   - Feature Module
   - Description & Step Details
   - Color-Coded Status (**PASS** in Green, **FAIL** in Red)
   - Duration in Milliseconds
   - Error Stack Trace & Failure Messages (if applicable)

---

## 🚀 How to Run the Appium Mobile Tests

### 1. Ensure Appium Server & Android Emulator / Device are Ready
- Start your Appium Server:
  ```bash
  appium
  ```
- Make sure an Android Emulator or physical device is connected (`adb devices`).

### 2. Run All Tests and Generate Excel Report
From the main project directory, run:
```bash
node appium-testing/runner.js
```

Or from inside `appium-testing/`:
```bash
cd appium-testing
npm run test:e2e
```

---

## 🔧 Environment Variables (Optional Customization)

You can customize device settings via environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `APPIUM_HOST` | Appium Server Host | `127.0.0.1` |
| `APPIUM_PORT` | Appium Server Port | `4723` |
| `ANDROID_DEVICE_NAME` | Android Device Name / Emulator | `Android Emulator` |
| `ANDROID_VERSION` | Android OS Version | `11.0` |
| `APP_URL` | Target Mobile App URL | `http://10.109.226.210:5173` |
| `APK_PATH` | Path to Android `.apk` | `./app-release.apk` |

Example:
```bash
ANDROID_DEVICE_NAME="Pixel_6_API_33" APP_URL="http://localhost:5173" node appium-testing/runner.js
```
