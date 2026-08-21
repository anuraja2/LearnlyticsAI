const BasePage = require('./BasePage');

class QuizPage extends BasePage {
  selectors = {
    subjectButtons: '.sub-btn',
    difficultySelect: '.level-select',
    startQuizButton: '.start-btn',
    questionText: '.question-text',
    optionButtons: '.option-btn',
    scoreText: '.score-text',
    playAgainBtn: '.play-again-btn',
    backBtn: '.back-btn-quiz'
  };

  async startQuiz(subject = 'Math', level = 'ages6-8') {
    const btn = await this.driver.$(`.sub-btn=${subject}`);
    if (await btn.isExisting()) {
      await btn.click();
    }
    await this.click(this.selectors.startQuizButton);
    await this.pause(1000);
  }

  async answerQuestion(optionIndex = 0) {
    const options = await this.driver.$$(this.selectors.optionButtons);
    if (options.length > optionIndex) {
      await options[optionIndex].click();
      await this.pause(1500); // Wait for score update/transition
    }
  }
}

module.exports = QuizPage;
