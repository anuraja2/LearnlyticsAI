const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class SeleniumExcelReporter {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.reportsDir = path.join(__dirname, '../reports');
    
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  addResult({ id, feature, testName, status, durationMs, errorMsg = '' }) {
    this.results.push({
      id: id || `TC-WEB-${String(this.results.length + 1).padStart(3, '0')}`,
      feature,
      testName,
      status: status.toUpperCase(),
      durationMs,
      errorMsg,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  async generateExcelReport(fileName = null) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SmartChild Selenium Automation Engine';
    workbook.created = new Date();

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFileName = fileName || `SmartChild_Selenium_Report_${timestampStr}.xlsx`;
    const filePath = path.join(this.reportsDir, finalFileName);

    // ==========================================
    // SHEET 1: EXECUTIVE DASHBOARD SUMMARY
    // ==========================================
    const summarySheet = workbook.addWorksheet('Web Execution Summary', {
      views: [{ showGridLines: true }]
    });

    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP' || r.status === 'SKIPPED').length;
    const passRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(2) : '0.00';
    const totalDurationSec = ((Date.now() - this.startTime) / 1000).toFixed(2);

    // Title Banner
    summarySheet.mergeCells('B2:F3');
    const titleCell = summarySheet.getCell('B2');
    titleCell.value = 'SmartChild AI - Selenium Web Application Test Analysis';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } }; // Teal Blue
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Metadata Table
    const metaData = [
      ['Target Application', 'SmartChild AI Web Application'],
      ['Automation Tool', 'Selenium WebDriver (Node.js)'],
      ['Target Browser', 'Google Chrome / Headless Web Engine'],
      ['Execution Date', new Date().toLocaleString()],
      ['Total Execution Time', `${totalDurationSec} seconds`]
    ];

    metaData.forEach((row, idx) => {
      const rNum = 5 + idx;
      summarySheet.getCell(`B${rNum}`).value = row[0];
      summarySheet.getCell(`B${rNum}`).font = { bold: true, color: { argb: '334155' } };
      summarySheet.getCell(`C${rNum}`).value = row[1];
    });

    // KPI Summary Cards
    const kpiRow = 11;
    const kpis = [
      { col: 'B', title: 'TOTAL TESTS', val: totalTests, color: '3B82F6' },
      { col: 'C', title: 'PASSED', val: passed, color: '22C55E' },
      { col: 'D', title: 'FAILED', val: failed, color: 'EF4444' },
      { col: 'E', title: 'SKIPPED', val: skipped, color: 'F59E0B' },
      { col: 'F', title: 'PASS RATE', val: `${passRate}%`, color: '0D9488' }
    ];

    kpis.forEach(k => {
      const cellHeader = summarySheet.getCell(`${k.col}${kpiRow}`);
      cellHeader.value = k.title;
      cellHeader.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
      cellHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.color } };
      cellHeader.alignment = { horizontal: 'center', vertical: 'middle' };

      const cellVal = summarySheet.getCell(`${k.col}${kpiRow + 1}`);
      cellVal.value = k.val;
      cellVal.font = { bold: true, size: 14, color: { argb: '0F172A' } };
      cellVal.alignment = { horizontal: 'center', vertical: 'middle' };
      cellVal.border = {
        bottom: { style: 'medium', color: { argb: k.color } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } }
      };
    });

    // Feature Breakdown
    summarySheet.getCell('B15').value = 'Web Feature Module Breakdown';
    summarySheet.getCell('B15').font = { bold: true, size: 12, color: { argb: '1E293B' } };

    summarySheet.getRow(16).values = ['', 'Feature Module', 'Total', 'Passed', 'Failed', 'Pass %'];
    summarySheet.getRow(16).font = { bold: true, color: { argb: 'FFFFFF' } };
    ['B', 'C', 'D', 'E', 'F'].forEach(c => {
      summarySheet.getCell(`${c}16`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
    });

    const featureMap = {};
    this.results.forEach(r => {
      if (!featureMap[r.feature]) {
        featureMap[r.feature] = { total: 0, pass: 0, fail: 0 };
      }
      featureMap[r.feature].total++;
      if (r.status === 'PASS') featureMap[r.feature].pass++;
      if (r.status === 'FAIL') featureMap[r.feature].fail++;
    });

    let currentFRow = 17;
    Object.keys(featureMap).forEach(feat => {
      const data = featureMap[feat];
      const rate = ((data.pass / data.total) * 100).toFixed(1) + '%';
      summarySheet.getRow(currentFRow).values = ['', feat, data.total, data.pass, data.fail, rate];
      currentFRow++;
    });

    // ==========================================
    // SHEET 2: DETAILED TEST RESULTS
    // ==========================================
    const detailSheet = workbook.addWorksheet('Detailed Test Results', {
      views: [{ showGridLines: true }]
    });

    detailSheet.columns = [
      { header: 'Test ID', key: 'id', width: 14 },
      { header: 'Feature Module', key: 'feature', width: 24 },
      { header: 'Test Case Description', key: 'testName', width: 42 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration (ms)', key: 'durationMs', width: 15 },
      { header: 'Error Details / Stack Trace', key: 'errorMsg', width: 50 },
      { header: 'Timestamp', key: 'timestamp', width: 14 }
    ];

    const headerRow = detailSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    headerRow.height = 24;
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    this.results.forEach(item => {
      const row = detailSheet.addRow(item);
      const statusCell = row.getCell('status');

      if (item.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        statusCell.font = { color: { argb: '15803D' }, bold: true };
      } else if (item.status === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: 'B91C1C' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        statusCell.font = { color: { argb: 'B45309' }, bold: true };
      }

      statusCell.alignment = { horizontal: 'center' };
    });

    detailSheet.columns.forEach(column => {
      let maxLen = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const len = cell.value ? cell.value.toString().length : 10;
        if (len > maxLen) maxLen = len;
      });
      column.width = Math.min(Math.max(maxLen + 4, 12), 60);
    });

    await workbook.xlsx.writeFile(filePath);
    console.log(`\n======================================================`);
    console.log(`📊 Selenium Excel Analysis Report Generated Successfully!`);
    console.log(`📍 Saved at: ${filePath}`);
    console.log(`======================================================\n`);

    return filePath;
  }
}

module.exports = SeleniumExcelReporter;
