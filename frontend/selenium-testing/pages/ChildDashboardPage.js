const BasePage = require('./BasePage');

class ChildDashboardPage extends BasePage {
  selectors = {
    headerGreeting: '.dashboard-header h1',
    screenTimeTimer: '.timer-badge',
    aiTutorCard: 'a[href="/ai-tutor"]',
    storyTimeCard: 'a[href="/story-learning"]',
    quizZoneCard: 'a[href="/quiz-zone"]',
    sosFloatingBtn: '.sos-floating-btn'
  };

  async openAiTutor() {
    await this.click(this.selectors.aiTutorCard);
  }

  async openStoryTime() {
    await this.click(this.selectors.storyTimeCard);
  }

  async openQuizZone() {
    await this.click(this.selectors.quizZoneCard);
  }
}

module.exports = ChildDashboardPage;
