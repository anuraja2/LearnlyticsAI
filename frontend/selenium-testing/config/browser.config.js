const { Builder, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Selenium WebDriver Configuration for Web Application Testing
 */
class BrowserConfig {
  static baseUrl = process.env.APP_URL || 'http://localhost:5173';

  static async createDriver(browserName = 'chrome', isHeadless = false) {
    let options = new chrome.Options();
    
    // Window resolution & options
    options.addArguments('--window-size=1440,900');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    if (isHeadless || process.env.HEADLESS === 'true') {
      options.addArguments('--headless=new');
    }

    const driver = await new Builder()
      .forBrowser(browserName)
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
    return driver;
  }
}

module.exports = BrowserConfig;
