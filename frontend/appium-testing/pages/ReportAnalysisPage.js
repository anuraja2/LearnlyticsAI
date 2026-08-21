const BasePage = require('./BasePage');

/**
 * Page Object: Report Analysis / AI Academic Assessment
 */
class ReportAnalysisPage extends BasePage {
  selectors = {
    pageTitle:          'h1.page-title',
    uploadBtn:          'button.btn-primary',
    fileInput:          'input[type="file"]',
    savedReportsSelect: 'select',
    addNewBtn:          'button.btn-secondary',
    assessmentTab:      'button.tab-btn:nth-child(1)',
    recommendationsTab: 'button.tab-btn:nth-child(2)',
    studyPlanTab:       'button.tab-btn:nth-child(3)',
    overallPercentage:  'span[style*="font-size: 48px"]',
    gradeChip:          'span[style*="background: #dcfce7"]',
    performanceLevel:   'p[style*="color: #2563eb"]',
    highestSubjects:    'strong[style*="color: #166534"]',
    lowestSubjects:     'strong[style*="color: #dc2626"]',
    subjectCards:       '.safety-card',
    aiSummaryText:      'p[style*="line-height: 1.6"]',
    errorAlert:         'div[style*="background: #fef2f2"]',
    successAlert:       'div[style*="background: #f0fdf4"]',
    loaderBox:          'div[style*="background: #eff6ff"]',
    emptyState:         'h2[style*="font-size: 22px"]',
    weeklyPlanCards:    'div[style*="border: 1px solid #cbd5e1"]',
    learningGoals:      'div[style*="border: 1px solid #e2e8f0"]',
    parentGuidance:     'div[style*="border: 1px solid #bfdbfe"]',
  };

  async uploadReport(filePath) {
    await this.click(this.selectors.uploadBtn);
    const fileInput = await this.driver.$(this.selectors.fileInput);
    await fileInput.setValue(filePath);
    await this.pause(2000);
  }

  async switchToTab(tabName) {
    const tabMap = {
      assessment: this.selectors.assessmentTab,
      recommendations: this.selectors.recommendationsTab,
      studyplan: this.selectors.studyPlanTab,
    };
    await this.click(tabMap[tabName]);
    await this.pause(500);
  }

  async getOverallPercentage() {
    return await this.getText(this.selectors.overallPercentage);
  }

  async getGrade() {
    return await this.getText(this.selectors.gradeChip);
  }
}

module.exports = ReportAnalysisPage;
