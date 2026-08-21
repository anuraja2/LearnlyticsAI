const BasePage = require('./BasePage');

class ParentDashboardPage extends BasePage {
  selectors = {
    brandTitle: '.brand span',
    navDashboard: '.nav-menu a[href="/parent-dashboard"]',
    navAnalytics: '.nav-menu a[href="/analytics"]',
    navAiInsights: '.nav-menu a[href="/ai-recommendations"]',
    sosHeaderBtn: '.sos-alert-btn',
    kpiCards: '.kpi-card',
    recentAlerts: '.pro-alert',
    weeklyChart: '.chart-container'
  };

  async openAnalytics() {
    await this.click(this.selectors.navAnalytics);
  }

  async openAiInsights() {
    await this.click(this.selectors.navAiInsights);
  }
}

module.exports = ParentDashboardPage;
