const BasePage = require('./BasePage');

class SosPage extends BasePage {
  selectors = {
    floatingSosBtn: '.sos-floating-btn',
    modalOverlay: '.sos-modal-overlay',
    modalCard: '.sos-modal-card',
    locationCheckbox: '.toggle-label input[type="checkbox"]',
    emergencyContactsList: '.emergency-contacts li',
    sendAlertBtn: '.sos-confirm',
    cancelBtn: '.sos-cancel',
    triggeredBanner: '.sos-triggered-banner'
  };

  async triggerSos() {
    await this.click(this.selectors.floatingSosBtn);
    await this.pause(500);
  }

  async sendAlert() {
    await this.click(this.selectors.sendAlertBtn);
    await this.pause(1000);
  }

  async cancelAlert() {
    await this.click(this.selectors.cancelBtn);
  }
}

module.exports = SosPage;
