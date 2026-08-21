const BasePage = require('./BasePage');

class ParentDashboardPage extends BasePage {
  selectors = {
    brandTitle: '.brand span',
    navDashboard: '.nav-menu a[href="/parent-dashboard"]',
    navAnalytics: '.nav-menu a[href="/analytics"]',
    navAiInsights: '.nav-menu a[href="/ai-recommendations"]',
    kpiCards: '.kpi-card',
    alertsList: '.alert-list'
  };

  async openAnalytics() {
    await this.click(this.selectors.navAnalytics);
  }

  async openAiInsights() {
    await this.click(this.selectors.navAiInsights);
  }
}

module.exports = ParentDashboardPage;
