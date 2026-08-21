const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automated QA';
  workbook.created = new Date();

  // =========================================================================
  // SHEET 1: Load Test Results
  // =========================================================================
  const sheet = workbook.addWorksheet('Load Test Results', { views: [{ showGridLines: true }] });

  sheet.mergeCells('B2:E3');
  const titleCell = sheet.getCell('B2');
  titleCell.value = 'Baseline Load Test Results (100 Concurrent Users / 1 Minute)';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  const metrics = [
    ['Requests per second (RPS)', '2035 req/sec'],
    ['Total Requests Handled', '~122,000'],
    ['Fastest Response Time', '35 ms'],
    ['Average Response Time', '48.67 ms'],
    ['Slowest Response Time', '313 ms'],
  ];

  sheet.getColumn('B').width = 30;
  sheet.getColumn('C').width = 25;

  metrics.forEach((item, index) => {
    const row = 5 + index;
    const keyCell = sheet.getCell(`B${row}`);
    const valCell = sheet.getCell(`C${row}`);

    keyCell.value = item[0];
    keyCell.font = { bold: true };
    keyCell.border = { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    valCell.value = item[1];
    valCell.alignment = { horizontal: 'right' };
    valCell.border = { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  sheet.mergeCells('B12:E12');
  sheet.getCell('B12').value = 'Detailed Interpretation';
  sheet.getCell('B12').font = { bold: true, size: 12 };
  sheet.getCell('B12').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };

  sheet.mergeCells('B13:E13');
  sheet.getCell('B13').value = 'RPS: Your API is handling about 2035 requests every second under load.';
  
  sheet.mergeCells('B14:E14');
  sheet.getCell('B14').value = 'Latency: The average response is very fast (48.67ms) with the slowest outlier being 313ms.';


  // =========================================================================
  // SHEET 2: Load Test Cases
  // =========================================================================
  const tcSheet = workbook.addWorksheet('Load Test Cases Matrix', { views: [{ showGridLines: true }] });

  tcSheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Test Category', key: 'category', width: 25 },
    { header: 'Scenario / Description', key: 'description', width: 50 },
    { header: 'Virtual Users', key: 'vus', width: 15 },
    { header: 'Duration', key: 'duration', width: 15 },
    { header: 'Expected SLA (Response)', key: 'sla', width: 25 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  const headerRow = tcSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  
  const testCases = [
    { id: 'LT-001', category: 'Baseline Load', description: 'Simulate 100 concurrent users on Homepage to establish baseline performance', vus: 100, duration: '1 min', sla: '< 500ms', status: 'PASS' },
    { id: 'LT-002', category: 'Baseline Load', description: 'Concurrent Parent/Child logins checking authentication throughput', vus: 100, duration: '1 min', sla: '< 800ms', status: 'PENDING' },
    { id: 'LT-003', category: 'Baseline Load', description: 'Concurrent fetching of Analytics Chart Data', vus: 100, duration: '1 min', sla: '< 1000ms', status: 'PENDING' },
    { id: 'LT-004', category: 'Stress Testing', description: 'Ramp up from 100 to 1000 users over 5 minutes to find breaking point', vus: '100->1000', duration: '5 min', sla: 'Graceful degradation', status: 'PENDING' },
    { id: 'LT-005', category: 'Stress Testing', description: 'Spike Test: Sudden surge of 500 users at once (simulating push notification)', vus: 500, duration: '30 sec', sla: '< 2000ms', status: 'PENDING' },
    { id: 'LT-006', category: 'Endurance (Soak)', description: 'Run 50 concurrent users constantly for 1 hour to check for memory leaks', vus: 50, duration: '1 hour', sla: 'Stable Memory Usage', status: 'PENDING' },
    { id: 'LT-007', category: 'API Performance', description: 'Emergency SOS API broadcast under extreme concurrency (200 requests/sec)', vus: 200, duration: '1 min', sla: '< 300ms', status: 'PENDING' },
    { id: 'LT-008', category: 'API Performance', description: 'Database Read Intensive: 100 users fetching large AI Tutor histories', vus: 100, duration: '2 min', sla: '< 1500ms', status: 'PENDING' },
    { id: 'LT-009', category: 'API Performance', description: 'Database Write Intensive: 100 children submitting quiz answers simultaneously', vus: 100, duration: '1 min', sla: '< 1000ms', status: 'PENDING' },
    { id: 'LT-010', category: 'Network Emulation', description: 'Simulate 3G slow network connections for 50 users on dashboard', vus: 50, duration: '1 min', sla: 'Correct UI Loading State', status: 'PENDING' }
  ];

  testCases.forEach((tc) => {
    const row = tcSheet.addRow(tc);
    if (tc.status === 'PASS') {
      row.getCell('status').font = { color: { argb: '15803D' }, bold: true };
    } else {
      row.getCell('status').font = { color: { argb: 'D97706' }, bold: true }; // Pending Orange
    }
  });


  const reportsDir = path.join(__dirname, 'reports');
  const outputPath = path.join(reportsDir, 'Baseline_Load_Test_Results_With_Cases.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  
  console.log(`Excel report successfully updated at: ${outputPath}`);
}

generateExcel().catch(console.error);
