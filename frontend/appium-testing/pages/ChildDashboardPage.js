const BasePage = require('./BasePage');

class ChildDashboardPage extends BasePage {
  selectors = {
    headerGreeting: '.dashboard-header h1',
    screenTimeCounter: '.timer-badge',
    aiTutorCard: 'a[href="/ai-tutor"]',
    storyTimeCard: 'a[href="/story-learning"]',
    quizZoneCard: 'a[href="/quiz-zone"]',
    sosButton: '.sos-floating-btn',
    dailyMissionCheckbox: '.task-item input[type="checkbox"]'
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

  async clickSos() {
    await this.click(this.selectors.sosButton);
  }
}

module.exports = ChildDashboardPage;
