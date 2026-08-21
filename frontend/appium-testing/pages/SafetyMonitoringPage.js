const BasePage = require('./BasePage');

/**
 * Page Object: Safety Monitoring
 */
class SafetyMonitoringPage extends BasePage {
  selectors = {
    pageTitle:          'h1',
    screenTimeCard:     '.safety-card',
    sosButton:          'button[style*="background: #dc2626"]',
    alertsList:         '.safety-card',
    emotionBeforeBtn:   'button[id*="before"]',
    emotionAfterBtn:    'button[id*="after"]',
    happyEmoji:         'button[title="Happy"]',
    screenTimeChart:    '.recharts-wrapper',
    alertBadge:         'span[style*="background: #fef2f2"]',
    weeklyChart:        '.recharts-bar',
    tabs:               '.safety-tabs button',
  };

  async triggerSOS() {
    await this.click(this.selectors.sosButton);
    await this.pause(1000);
  }

  async selectEmotion(phase, emotion) {
    const phaseBtn = phase === 'before'
      ? this.selectors.emotionBeforeBtn
      : this.selectors.emotionAfterBtn;
    await this.click(phaseBtn);
    await this.pause(300);
  }
}

module.exports = SafetyMonitoringPage;
