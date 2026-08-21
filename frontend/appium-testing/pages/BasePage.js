/**
 * Base Page Object Model for Appium Mobile Automation
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(url) {
    await this.driver.url(url);
  }

  async findElement(selector) {
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    return el;
  }

  async click(selector) {
    const el = await this.findElement(selector);
    await el.click();
  }

  async type(selector, text) {
    const el = await this.findElement(selector);
    await el.setValue(text);
  }

  async getText(selector) {
    const el = await this.findElement(selector);
    return await el.getText();
  }

  async isVisible(selector) {
    try {
      const el = await this.driver.$(selector);
      return await el.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async scrollIntoView(selector) {
    const el = await this.driver.$(selector);
    await el.scrollIntoView();
  }

  async pause(ms = 1000) {
    await this.driver.pause(ms);
  }
}

module.exports = BasePage;
