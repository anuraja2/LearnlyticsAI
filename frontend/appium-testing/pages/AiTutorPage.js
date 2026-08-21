const BasePage = require('./BasePage');

class AiTutorPage extends BasePage {
  selectors = {
    subjectPills: '.subject-pill',
    mathSubjectBtn: '.subject-pill:nth-child(1)',
    scienceSubjectBtn: '.subject-pill:nth-child(2)',
    historySubjectBtn: '.subject-pill:nth-child(3)',
    chatInput: '.chat-input',
    sendButton: '.send-btn',
    messageBubble: '.message-bubble',
    voiceToggleBtn: '.voice-toggle',
    backBtn: '.back-btn'
  };

  async selectSubject(subjectName) {
    if (subjectName === 'Math') await this.click(this.selectors.mathSubjectBtn);
    if (subjectName === 'Science') await this.click(this.selectors.scienceSubjectBtn);
    if (subjectName === 'History') await this.click(this.selectors.historySubjectBtn);
    await this.pause(500);
  }

  async askQuestion(questionText) {
    await this.type(this.selectors.chatInput, questionText);
    await this.click(this.selectors.sendButton);
    await this.pause(2000); // Wait for AI mock response
  }

  async getLastResponse() {
    const messages = await this.driver.$$(this.selectors.messageBubble);
    if (messages.length > 0) {
      return await messages[messages.length - 1].getText();
    }
    return '';
  }
}

module.exports = AiTutorPage;
