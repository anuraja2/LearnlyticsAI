const { expect } = require('chai');
const BrowserConfig = require('../config/browser.config');
const LoginPage = require('../pages/LoginPage');

describe('Selenium Web Module 1: Authentication & Role Redirection', function () {
  this.timeout(60000);
  let driver;
  let loginPage;

  before(async function () {
    driver = await BrowserConfig.createDriver('chrome', true);
    loginPage = new LoginPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-WEB-AUTH-001: Parent Role Login Redirection', async function () {
    await loginPage.navigateTo(BrowserConfig.baseUrl + '/login');
    await loginPage.login('parent@example.com', 'Password123', 'parent');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/parent-dashboard');
  });

  it('TC-WEB-AUTH-002: Child Role Login Redirection', async function () {
    await loginPage.navigateTo(BrowserConfig.baseUrl + '/login');
    await loginPage.login('child@example.com', 'Kids1234', 'child');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/child-dashboard');
  });
});
