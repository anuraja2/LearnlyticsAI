const BasePage = require('./BasePage');

class AuthPage extends BasePage {
  // Locators
  selectors = {
    parentRoleRadio: 'input[value="parent"]',
    childRoleRadio: 'input[value="child"]',
    adminRoleRadio: 'input[value="admin"]',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    nameInput: 'input[placeholder="Enter your name"]',
    signInButton: 'button[type="submit"]',
    forgotPasswordLink: 'a[href="/forgot-password"]',
    signUpLink: 'a[href="/signup"]',
    logInLink: 'a[href="/login"]',
    authTitle: '.auth-title'
  };

  async selectRole(roleName) {
    const roleSelector = `input[value="${roleName}"]`;
    await this.click(roleSelector);
  }

  async login(email, password, role = 'parent') {
    await this.selectRole(role);
    await this.type(this.selectors.emailInput, email);
    await this.type(this.selectors.passwordInput, password);
    await this.click(this.selectors.signInButton);
    await this.pause(1000);
  }

  async signup(name, email, password, role = 'child') {
    await this.selectRole(role);
    await this.type(this.selectors.nameInput, name);
    await this.type(this.selectors.emailInput, email);
    await this.type(this.selectors.passwordInput, password);
    await this.click(this.selectors.signInButton);
    await this.pause(1000);
  }
}

module.AuthPage = AuthPage;
module.exports = AuthPage;
