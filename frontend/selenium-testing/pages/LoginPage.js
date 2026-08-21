const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  selectors = {
    parentRoleRadio: 'input[value="parent"]',
    childRoleRadio: 'input[value="child"]',
    adminRoleRadio: 'input[value="admin"]',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    nameInput: 'input[placeholder="Enter your name"]',
    signInBtn: 'button[type="submit"]',
    authTitle: '.auth-title'
  };

  async selectRole(roleName) {
    await this.click(`input[value="${roleName}"]`);
  }

  async login(email, password, role = 'parent') {
    await this.selectRole(role);
    await this.type(this.selectors.emailInput, email);
    await this.type(this.selectors.passwordInput, password);
    await this.click(this.selectors.signInBtn);
    await this.sleep(1000);
  }

  async signup(name, email, password, role = 'child') {
    await this.selectRole(role);
    await this.type(this.selectors.nameInput, name);
    await this.type(this.selectors.emailInput, email);
    await this.type(this.selectors.passwordInput, password);
    await this.click(this.selectors.signInBtn);
    await this.sleep(1000);
  }
}

module.exports = LoginPage;
