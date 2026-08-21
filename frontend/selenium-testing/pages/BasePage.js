const { By, until } = require('selenium-webdriver');

/**
 * Base Page Object Model for Selenium WebDriver Web Automation
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(url) {
    await this.driver.get(url);
  }

  async find(cssSelector, timeout = 10000) {
    const element = await this.driver.wait(
      until.elementLocated(By.css(cssSelector)),
      timeout
    );
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  async click(cssSelector) {
    const element = await this.find(cssSelector);
    await element.click();
  }

  async type(cssSelector, text) {
    const element = await this.find(cssSelector);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(cssSelector) {
    const element = await this.find(cssSelector);
    return await element.getText();
  }

  async isVisible(cssSelector, timeout = 3000) {
    try {
      const element = await this.driver.wait(
        until.elementLocated(By.css(cssSelector)),
        timeout
      );
      return await element.isDisplayed();
    } catch (err) {
      return false;
    }
  }

  async sleep(ms = 1000) {
    await this.driver.sleep(ms);
  }
}

module.exports = BasePage;
