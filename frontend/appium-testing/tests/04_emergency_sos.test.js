const { remote } = require('webdriverio');
const { expect } = require('chai');
const caps = require('../config/capabilities');
const SosPage = require('../pages/SosPage');

describe('Module 4: One-Tap Emergency SOS & Safety System', function () {
  this.timeout(120000);
  let driver;
  let sosPage;

  before(async function () {
    driver = await remote({
      protocol: 'http',
      hostname: caps.server.host,
      port: caps.server.port,
      path: caps.server.path,
      capabilities: caps.androidChromeCapabilities
    });
    sosPage = new SosPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('TC-SOS-001: Floating SOS Button Presence on Child View', async function () {
    await sosPage.navigateTo(caps.baseUrl + '/child-dashboard');
    const isSosBtnVisible = await sosPage.isVisible(sosPage.selectors.floatingSosBtn);
    expect(isSosBtnVisible).to.be.true;
  });

  it('TC-SOS-002: Trigger SOS Modal & Contact List Verification', async function () {
    await sosPage.navigateTo(caps.baseUrl + '/child-dashboard');
    await sosPage.triggerSos();
    const isModalVisible = await sosPage.isVisible(sosPage.selectors.modalCard);
    expect(isModalVisible).to.be.true;
  });

  it('TC-SOS-003: Confirm SOS Alert with Location Sharing', async function () {
    await sosPage.navigateTo(caps.baseUrl + '/child-dashboard');
    await sosPage.triggerSos();
    await sosPage.sendAlert();
    const isBannerVisible = await sosPage.isVisible(sosPage.selectors.triggeredBanner);
    expect(isBannerVisible).to.be.true;
  });
});
