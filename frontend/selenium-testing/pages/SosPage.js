const BasePage = require('./BasePage');

class SosPage extends BasePage {
  selectors = {
    floatingSosBtn: '.sos-floating-btn',
    modalOverlay: '.sos-modal-overlay',
    modalCard: '.sos-modal-card',
    locationCheckbox: '.toggle-label input[type="checkbox"]',
    contactsList: '.emergency-contacts li',
    sendAlertBtn: '.sos-confirm',
    cancelBtn: '.sos-cancel',
    triggeredBanner: '.sos-triggered-banner'
  };

  async triggerSos() {
    await this.click(this.selectors.floatingSosBtn);
    await this.sleep(500);
  }

  async sendAlert() {
    await this.click(this.selectors.sendAlertBtn);
    await this.sleep(1000);
  }
}

module.exports = SosPage;
