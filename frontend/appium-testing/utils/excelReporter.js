const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Enhanced Excel Reporter — generates a full multi-sheet analysis report
 * for the SafetyAI / Learnlytics Appium Android test suite (305 test cases).
 */
class ExcelReporter {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  addResult({ id, feature, testType, testName, status, durationMs, errorMsg = '' }) {
    this.results.push({
      id: id || `TC-${String(this.results.length + 1).padStart(3, '0')}`,
      feature,
      testType: testType || 'Functional',
      testName,
      status: (status || 'PASS').toUpperCase(),
      durationMs: durationMs || 0,
      errorMsg,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  _styleHeader(cell, bgColor = '1E3A8A') {
    cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  }

  _styleKPI(sheet, col, row, title, value, color) {
    const hCell = sheet.getCell(`${col}${row}`);
    hCell.value = title;
    hCell.font = { bold: true, size: 9, color: { argb: 'FFFFFF' } };
    hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    hCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const vCell = sheet.getCell(`${col}${row + 1}`);
    vCell.value = value;
    vCell.font = { bold: true, size: 16, color: { argb: '0F172A' } };
    vCell.alignment = { horizontal: 'center', vertical: 'middle' };
    vCell.border = {
      bottom: { style: 'medium', color: { argb: color } },
      left: { style: 'thin', color: { argb: 'E2E8F0' } },
      right: { style: 'thin', color: { argb: 'E2E8F0' } }
    };
  }

  async generateExcelReport(fileName = null) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SafetyAI Appium Automation Engine v2';
    wb.created = new Date();

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const finalName = fileName || `SafetyAI_Appium_Full_Report_${ts}.xlsx`;
    const filePath = path.join(this.reportsDir, finalName);

    const total    = this.results.length;
    const passed   = this.results.filter(r => r.status === 'PASS').length;
    const failed   = this.results.filter(r => r.status === 'FAIL').length;
    const skipped  = this.results.filter(r => r.status === 'SKIP' || r.status === 'SKIPPED').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
    const elapsed  = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const avgDur   = total > 0 ? Math.round(this.results.reduce((s, r) => s + r.durationMs, 0) / total) : 0;

    // ── SHEET 1: Executive Summary ─────────────────────────────────────────────
    const s1 = wb.addWorksheet('📊 Executive Summary');
    s1.getColumn('A').width = 4;
    ['B','C','D','E','F','G'].forEach(c => s1.getColumn(c).width = 22);

    s1.mergeCells('B2:G3');
    const titleCell = s1.getCell('B2');
    titleCell.value = '🤖 SafetyAI / Learnlytics — Appium Android Mobile Test Report';
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    s1.getRow(2).height = 40;
    s1.getRow(3).height = 20;

    // Metadata
    const meta = [
      ['📱 Target App',         'SafetyAI / Learnlytics AI (Android PWA + Capacitor APK)'],
      ['🤖 Automation Tool',   'Appium v2 + UiAutomator2 + WebdriverIO (Node.js)'],
      ['📡 Platform',           'Android OS — Chrome Browser / Native WebView'],
      ['📅 Execution Date',     new Date().toLocaleString()],
      ['⏱ Total Duration',      `${elapsed} seconds`],
      ['📋 Total Test Cases',   String(total)],
      ['⚡ Avg Duration/Test',  `${avgDur} ms`],
      ['🎯 Deployable Status',  parseFloat(passRate) >= 90 ? '✅ READY FOR DEPLOYMENT' : parseFloat(passRate) >= 75 ? '⚠️ CONDITIONAL DEPLOYMENT' : '❌ NOT READY'],
    ];
    meta.forEach(([k, v], i) => {
      const r = 5 + i;
      const kc = s1.getCell(`B${r}`);
      kc.value = k; kc.font = { bold: true, color: { argb: '1E293B' } };
      const vc = s1.getCell(`C${r}`);
      vc.value = v;
      s1.mergeCells(`C${r}:G${r}`);
      s1.getRow(r).height = 18;
    });

    // KPI Cards
    const kpiRow = 14;
    this._styleKPI(s1, 'B', kpiRow, '📋 TOTAL', total, '3B82F6');
    this._styleKPI(s1, 'C', kpiRow, '✅ PASSED', passed, '22C55E');
    this._styleKPI(s1, 'D', kpiRow, '❌ FAILED', failed, 'EF4444');
    this._styleKPI(s1, 'E', kpiRow, '⏭ SKIPPED', skipped, 'F59E0B');
    this._styleKPI(s1, 'F', kpiRow, '📈 PASS RATE', `${passRate}%`, '8B5CF6');
    this._styleKPI(s1, 'G', kpiRow, '⏱ DURATION', `${elapsed}s`, '0EA5E9');
    [kpiRow, kpiRow+1].forEach(r => s1.getRow(r).height = 30);

    // Test Type Breakdown
    s1.getCell('B17').value = '📊 Test Type Distribution';
    s1.getCell('B17').font = { bold: true, size: 13, color: { argb: '1E293B' } };
    s1.getRow(18).values = ['', 'Test Type', 'Total', 'Passed', 'Failed', 'Pass %', 'Status'];
    ['B','C','D','E','F','G'].forEach(c => this._styleHeader(s1.getCell(`${c}18`), '475569'));

    const typeMap = {};
    this.results.forEach(r => {
      const t = r.testType || 'Functional';
      if (!typeMap[t]) typeMap[t] = { total: 0, pass: 0, fail: 0 };
      typeMap[t].total++;
      if (r.status === 'PASS') typeMap[t].pass++;
      if (r.status === 'FAIL') typeMap[t].fail++;
    });

    const typeColors = {
      'Functional': 'DBEAFE', 'Validation': 'FCE7F3', 'UI/UX': 'F3E8FF',
      'Unit': 'DCFCE7', 'Security': 'FEF9C3', 'Deployable': 'FFEDD5', 'E2E': 'E0E7FF'
    };
    let tRow = 19;
    Object.entries(typeMap).forEach(([type, data]) => {
      const rate = ((data.pass / data.total) * 100).toFixed(1);
      const status = parseFloat(rate) >= 90 ? '✅ Pass' : parseFloat(rate) >= 70 ? '⚠️ Partial' : '❌ Fail';
      const row = s1.getRow(tRow++);
      row.values = ['', type, data.total, data.pass, data.fail, `${rate}%`, status];
      const bg = typeColors[type] || 'F8FAFC';
      ['B','C','D','E','F','G'].forEach(c => {
        s1.getCell(`${c}${tRow - 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      });
    });

    // Feature Module Breakdown
    const fStartRow = tRow + 2;
    s1.getCell(`B${fStartRow}`).value = '🏗 Feature Module Breakdown';
    s1.getCell(`B${fStartRow}`).font = { bold: true, size: 13, color: { argb: '1E293B' } };
    s1.getRow(fStartRow + 1).values = ['', 'Feature Module', 'Total', 'Passed', 'Failed', 'Pass %', 'Deployable'];
    ['B','C','D','E','F','G'].forEach(c => this._styleHeader(s1.getCell(`${c}${fStartRow + 1}`), '1E3A8A'));

    const featMap = {};
    this.results.forEach(r => {
      if (!featMap[r.feature]) featMap[r.feature] = { total: 0, pass: 0, fail: 0 };
      featMap[r.feature].total++;
      if (r.status === 'PASS') featMap[r.feature].pass++;
      if (r.status === 'FAIL') featMap[r.feature].fail++;
    });

    let fRow = fStartRow + 2;
    Object.entries(featMap).forEach(([feat, data]) => {
      const rate = ((data.pass / data.total) * 100).toFixed(1);
      const deployable = parseFloat(rate) >= 90 ? '✅ Ready' : parseFloat(rate) >= 75 ? '⚠️ Conditional' : '❌ Not Ready';
      s1.getRow(fRow++).values = ['', feat, data.total, data.pass, data.fail, `${rate}%`, deployable];
    });

    // ── SHEET 2: Detailed Results ──────────────────────────────────────────────
    const s2 = wb.addWorksheet('📋 All Test Results');
    s2.columns = [
      { header: 'Test ID',        key: 'id',        width: 16 },
      { header: 'Feature Module', key: 'feature',   width: 24 },
      { header: 'Test Type',      key: 'testType',  width: 14 },
      { header: 'Test Case Description', key: 'testName', width: 55 },
      { header: 'Status',         key: 'status',    width: 10 },
      { header: 'Duration (ms)',  key: 'durationMs',width: 14 },
      { header: 'Error / Notes',  key: 'errorMsg',  width: 45 },
      { header: 'Timestamp',      key: 'timestamp', width: 12 },
    ];
    const hdr = s2.getRow(1);
    hdr.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }; hdr.height = 28;
    hdr.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    const statusColors = { PASS: { bg: 'DCFCE7', fg: '15803D' }, FAIL: { bg: 'FEE2E2', fg: 'B91C1C' }, SKIP: { bg: 'FEF3C7', fg: 'B45309' }, SKIPPED: { bg: 'FEF3C7', fg: 'B45309' } };
    const typeColors2  = { Functional: 'DBEAFE', Validation: 'FCE7F3', 'UI/UX': 'F3E8FF', Unit: 'DCFCE7', Security: 'FEF9C3', Deployable: 'FFEDD5', E2E: 'E0E7FF' };

    this.results.forEach((item, idx) => {
      const row = s2.addRow(item);
      row.height = 20;
      const sc = statusColors[item.status] || { bg: 'F1F5F9', fg: '475569' };
      const statusCell = row.getCell('status');
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } };
      statusCell.font = { color: { argb: sc.fg }, bold: true };
      statusCell.alignment = { horizontal: 'center' };

      const typeCell = row.getCell('testType');
      const tc = typeColors2[item.testType] || 'F8FAFC';
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tc } };
      typeCell.alignment = { horizontal: 'center' };

      // Zebra striping
      if (idx % 2 === 0) {
        ['id','feature','testName','durationMs','errorMsg','timestamp'].forEach(k => {
          const cell = row.getCell(k);
          if (!cell.fill || !cell.fill.fgColor) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
          }
        });
      }
    });

    // Freeze header row
    s2.views = [{ state: 'frozen', ySplit: 1 }];
    s2.autoFilter = { from: 'A1', to: 'H1' };

    // ── SHEET 3: FAILED Tests ─────────────────────────────────────────────────
    const s3 = wb.addWorksheet('❌ Failed Tests');
    const failed_tests = this.results.filter(r => r.status === 'FAIL');

    s3.mergeCells('A1:G2');
    s3.getCell('A1').value = `❌ Failed Tests — ${failed_tests.length} Failure(s) Detected`;
    s3.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    s3.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B91C1C' } };
    s3.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    s3.getRow(1).height = 36;

    s3.columns = [
      { header: 'Test ID', key: 'id', width: 16 },
      { header: 'Feature', key: 'feature', width: 22 },
      { header: 'Test Type', key: 'testType', width: 14 },
      { header: 'Description', key: 'testName', width: 50 },
      { header: 'Error Message', key: 'errorMsg', width: 50 },
      { header: 'Duration (ms)', key: 'durationMs', width: 14 },
      { header: 'Remediation', key: 'remediation', width: 40 },
    ];
    const fHdr = s3.getRow(3);
    fHdr.font = { bold: true, color: { argb: 'FFFFFF' } }; fHdr.height = 24;
    fHdr.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B91C1C' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    if (failed_tests.length === 0) {
      s3.getRow(4).values = ['', '', '', '🎉 All tests passed! No failures detected.'];
      s3.getCell('D4').font = { color: { argb: '15803D' }, bold: true, size: 13 };
    } else {
      failed_tests.forEach(item => {
        s3.addRow({
          ...item,
          remediation: `Review ${item.feature} module. Check selectors, API connectivity, and data state.`
        });
      });
    }
    s3.views = [{ state: 'frozen', ySplit: 3 }];

    // ── SHEET 4: Test Coverage Matrix ────────────────────────────────────────
    const s4 = wb.addWorksheet('🗂 Coverage Matrix');
    s4.mergeCells('A1:H2');
    s4.getCell('A1').value = '🗂 Test Coverage Matrix — Feature × Test Type';
    s4.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    s4.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
    s4.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    s4.getRow(1).height = 36;

    const testTypes = ['Functional', 'Validation', 'UI/UX', 'Unit', 'Security', 'Deployable', 'E2E'];
    const features  = Object.keys(featMap);

    const hdrRow = s4.getRow(4);
    hdrRow.values = ['Feature Module', ...testTypes, 'Total'];
    hdrRow.eachCell(c => {
      c.font = { bold: true, color: { argb: 'FFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
      c.alignment = { horizontal: 'center' };
    });
    s4.getColumn(1).width = 30;
    testTypes.forEach((_, i) => s4.getColumn(i + 2).width = 14);

    features.forEach((feat, fi) => {
      const rowVals = [feat];
      let rowTotal = 0;
      testTypes.forEach(tt => {
        const cnt = this.results.filter(r => r.feature === feat && r.testType === tt).length;
        rowVals.push(cnt > 0 ? cnt : '-');
        rowTotal += cnt;
      });
      rowVals.push(rowTotal);
      const r = s4.getRow(5 + fi);
      r.values = rowVals;
      r.height = 20;
      if (fi % 2 === 0) {
        r.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } });
      }
    });

    // Totals row
    const totalsRow = s4.getRow(5 + features.length);
    const totalsVals = ['TOTAL'];
    testTypes.forEach(tt => {
      totalsVals.push(this.results.filter(r => r.testType === tt).length);
    });
    totalsVals.push(total);
    totalsRow.values = totalsVals;
    totalsRow.font = { bold: true };
    totalsRow.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } });

    // ── SHEET 5: Deployable Status Summary ───────────────────────────────────
    const s5 = wb.addWorksheet('🚀 Deployable Status');
    s5.mergeCells('A1:F2');
    s5.getCell('A1').value = '🚀 Deployment Readiness Report — SafetyAI Android App';
    s5.getCell('A1').font = { bold: true, size: 15, color: { argb: 'FFFFFF' } };
    const deployColor = parseFloat(passRate) >= 90 ? '15803D' : parseFloat(passRate) >= 75 ? 'B45309' : 'B91C1C';
    s5.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: deployColor } };
    s5.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    s5.getRow(1).height = 40;

    const deployRows = [
      ['Criterion', 'Threshold', 'Actual', 'Status'],
      ['Overall Pass Rate',    '≥ 90%', `${passRate}%`,     parseFloat(passRate) >= 90 ? '✅ PASS' : '❌ FAIL'],
      ['Authentication Tests', '100%',  `${(this.results.filter(r => r.feature === 'Authentication' && r.status === 'PASS').length / Math.max(1, this.results.filter(r => r.feature === 'Authentication').length) * 100).toFixed(1)}%`, '—'],
      ['No Critical Failures', '0',     String(failed),  failed === 0 ? '✅ PASS' : '❌ FAIL'],
      ['E2E Tests Pass Rate',  '≥ 80%',  `${(this.results.filter(r => r.testType === 'E2E' && r.status === 'PASS').length / Math.max(1, this.results.filter(r => r.testType === 'E2E').length) * 100).toFixed(1)}%`, '—'],
      ['Security Tests',       '100%',   `${(this.results.filter(r => r.testType === 'Security' && r.status === 'PASS').length / Math.max(1, this.results.filter(r => r.testType === 'Security').length) * 100).toFixed(1)}%`, '—'],
      ['Total Test Cases',     '≥ 300',  String(total),   total >= 300 ? '✅ PASS' : '⚠️ PARTIAL'],
      ['', '', '', ''],
      ['OVERALL VERDICT', '', '', parseFloat(passRate) >= 90 ? '✅ READY FOR PRODUCTION DEPLOYMENT' : parseFloat(passRate) >= 75 ? '⚠️ CONDITIONAL — Fix failures before deploying' : '❌ NOT READY — Critical failures present'],
    ];

    deployRows.forEach((row, idx) => {
      const r = s5.getRow(4 + idx);
      r.values = row; r.height = 22;
      if (idx === 0) {
        r.font = { bold: true, color: { argb: 'FFFFFF' } };
        r.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } });
      }
    });
    ['A','B','C','D','E','F'].forEach((c, i) => s5.getColumn(i + 1).width = [32, 14, 14, 38, 14, 14][i] || 14);

    // ── Write File ────────────────────────────────────────────────────────────
    await wb.xlsx.writeFile(filePath);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SafetyAI Appium Excel Report Generated Successfully!`);
    console.log(`📍 Path: ${filePath}`);
    console.log(`📋 Total Tests: ${total} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}% | ⏱ Duration: ${elapsed}s`);
    console.log(`${'='.repeat(60)}\n`);
    return filePath;
  }
}

module.exports = ExcelReporter;
