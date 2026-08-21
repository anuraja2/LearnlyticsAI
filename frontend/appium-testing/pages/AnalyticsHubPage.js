const BasePage = require('./BasePage');

/**
 * Page Object: Analytics Hub
 */
class AnalyticsHubPage extends BasePage {
  selectors = {
    pageTitle:        'h1',
    subjectFilter:    'select',
    quizChart:        '.recharts-line',
    progressBars:     '.recharts-bar',
    subjectCards:     '.card',
    performanceBadge: 'span[style*="background"]',
    streakCount:      'span[style*="font-size: 32px"]',
    chartContainer:   '.recharts-wrapper',
    noDataMsg:        'p[style*="color: #64748b"]',
  };

  async selectSubjectFilter(subject) {
    const el = await this.findElement(this.selectors.subjectFilter);
    await el.selectByVisibleText(subject);
    await this.pause(500);
  }
}

module.exports = AnalyticsHubPage;
