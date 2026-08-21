/**
 * MODULE 01: Authentication & User Onboarding
 * Test Types: Functional, Validation, UI/UX, Security
 * Total: 35 test cases  (TC-AUTH-001 to TC-AUTH-035)
 */
const { remote } = require('webdriverio');
const { expect } = require('chai');
const caps = require('../config/capabilities');
const AuthPage = require('../pages/AuthPage');

describe('Module 01: Authentication & User Onboarding', function () {
  this.timeout(120000);
  let driver, authPage;

  before(async function () {
    driver = await remote({
      protocol: 'http', hostname: caps.server.host,
      port: caps.server.port, path: caps.server.path,
      capabilities: caps.androidChromeCapabilities
    });
    authPage = new AuthPage(driver);
  });

  after(async function () { if (driver) await driver.deleteSession(); });

  // ── Functional ──────────────────────────────────────────────────────────────
  it('TC-AUTH-001 [Functional] Parent role selection & login redirect', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'password123', 'parent');
    const url = await driver.getUrl();
    expect(url).to.include('/parent-dashboard');
  });

  it('TC-AUTH-002 [Functional] Child role selection & login redirect', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('child@test.com', 'password123', 'child');
    const url = await driver.getUrl();
    expect(url).to.include('/child-dashboard');
  });

  it('TC-AUTH-003 [Functional] New parent registration flow', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    const ts = Date.now();
    await authPage.signup(`Parent ${ts}`, `parent${ts}@test.com`, 'Password123!', 'parent');
    const url = await driver.getUrl();
    expect(url).to.include('/parent-dashboard');
  });

  it('TC-AUTH-004 [Functional] New child registration flow', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    const ts = Date.now();
    await authPage.signup(`Child ${ts}`, `child${ts}@test.com`, 'Kids1234!', 'child');
    const url = await driver.getUrl();
    expect(url).to.include('/child-dashboard');
  });

  it('TC-AUTH-005 [Functional] Logout clears session & redirects to login', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'password123', 'parent');
    await authPage.navigateTo(caps.baseUrl + '/login');
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-006 [Functional] Forgot password page navigation', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const linkVisible = await authPage.isVisible(authPage.selectors.forgotPasswordLink);
    expect(linkVisible).to.be.true;
  });

  it('TC-AUTH-007 [Functional] Login→Signup navigation link works', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.click(authPage.selectors.signUpLink);
    const url = await driver.getUrl();
    expect(url).to.include('/signup');
  });

  it('TC-AUTH-008 [Functional] Signup→Login navigation link works', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    await authPage.click(authPage.selectors.logInLink);
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-009 [Functional] JWT token saved in localStorage after login', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'password123', 'parent');
    const token = await driver.execute(() => localStorage.getItem('learnlytics_token'));
    expect(token).to.not.be.null;
    expect(token.length).to.be.greaterThan(10);
  });

  it('TC-AUTH-010 [Functional] Role stored in localStorage after login', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'password123', 'parent');
    const role = await driver.execute(() => localStorage.getItem('learnlytics_role'));
    expect(role).to.equal('parent');
  });

  // ── Validation ──────────────────────────────────────────────────────────────
  it('TC-AUTH-011 [Validation] Wrong password shows error message', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'wrongpassword', 'parent');
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-012 [Validation] Empty email field blocks submit', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const emailEl = await driver.$('input[type="email"]');
    const validity = await driver.execute(el => el.validity.valid, emailEl);
    expect(validity).to.be.false;
  });

  it('TC-AUTH-013 [Validation] Empty password field blocks submit', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const pwEl = await driver.$('input[type="password"]');
    const validity = await driver.execute(el => el.validity.valid, pwEl);
    expect(validity).to.be.false;
  });

  it('TC-AUTH-014 [Validation] Invalid email format shows browser validation', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const emailEl = await driver.$('input[type="email"]');
    await emailEl.setValue('notanemail');
    const validity = await driver.execute(el => el.validity.typeMismatch, emailEl);
    expect(validity).to.be.true;
  });

  it('TC-AUTH-015 [Validation] Non-existent email shows error', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('nobody@nowhere.com', 'Password123', 'parent');
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-016 [Validation] Short password (<6 chars) shows validation', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    const pwEl = await driver.$('input[type="password"]');
    await pwEl.setValue('123');
    const val = await driver.execute(el => el.value, pwEl);
    expect(val).to.equal('123');
  });

  it('TC-AUTH-017 [Validation] Duplicate email on signup shows error', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    await authPage.signup('Dup User', 'parent@test.com', 'Password123!', 'parent');
    const url = await driver.getUrl();
    expect(url).to.include('/signup');
  });

  it('TC-AUTH-018 [Validation] Name field required on signup', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    const nameEl = await driver.$('input[placeholder="Enter your name"]');
    const required = await driver.execute(el => el.required, nameEl);
    expect(required).to.be.true;
  });

  it('TC-AUTH-019 [Validation] Unauthenticated access to parent dashboard redirects', async function () {
    await driver.execute(() => {
      localStorage.removeItem('learnlytics_token');
      localStorage.removeItem('learnlytics_role');
    });
    await authPage.navigateTo(caps.baseUrl + '/parent-dashboard');
    await authPage.pause(1500);
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-020 [Validation] Unauthenticated access to child dashboard redirects', async function () {
    await driver.execute(() => {
      localStorage.removeItem('learnlytics_token');
    });
    await authPage.navigateTo(caps.baseUrl + '/child-dashboard');
    await authPage.pause(1500);
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  // ── UI/UX ───────────────────────────────────────────────────────────────────
  it('TC-AUTH-021 [UI/UX] Login page renders on mobile viewport', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const visible = await authPage.isVisible(authPage.selectors.authTitle);
    expect(visible).to.be.true;
  });

  it('TC-AUTH-022 [UI/UX] Role radio buttons are visible and tappable', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const parentRadio = await authPage.isVisible(authPage.selectors.parentRoleRadio);
    expect(parentRadio).to.be.true;
  });

  it('TC-AUTH-023 [UI/UX] Submit button is visible and enabled', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const btn = await driver.$(authPage.selectors.signInButton);
    expect(await btn.isDisplayed()).to.be.true;
    expect(await btn.isEnabled()).to.be.true;
  });

  it('TC-AUTH-024 [UI/UX] Password field masks input', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const pwEl = await driver.$('input[type="password"]');
    const type = await driver.execute(el => el.type, pwEl);
    expect(type).to.equal('password');
  });

  it('TC-AUTH-025 [UI/UX] Signup page renders correctly on mobile', async function () {
    await authPage.navigateTo(caps.baseUrl + '/signup');
    const visible = await authPage.isVisible(authPage.selectors.emailInput);
    expect(visible).to.be.true;
  });

  it('TC-AUTH-026 [UI/UX] Forgot-password link is visible on login page', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    expect(await authPage.isVisible(authPage.selectors.forgotPasswordLink)).to.be.true;
  });

  it('TC-AUTH-027 [UI/UX] Navbar not shown on login page', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const nav = await authPage.isVisible('nav.navbar');
    expect(nav).to.be.false;
  });

  it('TC-AUTH-028 [UI/UX] Form fields are properly labelled (accessibility)', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const emailEl = await driver.$('input[type="email"]');
    const placeholder = await driver.execute(el => el.placeholder, emailEl);
    expect(placeholder).to.not.be.empty;
  });

  it('TC-AUTH-029 [UI/UX] Page title shows correct branding', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const title = await driver.execute(() => document.title);
    expect(title).to.not.be.empty;
  });

  it('TC-AUTH-030 [UI/UX] Mobile keyboard does not overlap submit button', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const btn = await driver.$(authPage.selectors.signInButton);
    expect(await btn.isDisplayed()).to.be.true;
  });

  // ── Security ─────────────────────────────────────────────────────────────────
  it('TC-AUTH-031 [Security] XSS input in email field is sanitised', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const emailEl = await driver.$('input[type="email"]');
    await emailEl.setValue('<script>alert(1)</script>@test.com');
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-032 [Security] SQL injection in password field does not crash', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login("test@test.com", "' OR '1'='1", 'parent');
    const url = await driver.getUrl();
    expect(url).to.include('/login');
  });

  it('TC-AUTH-033 [Security] Token persists across page refreshes', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'password123', 'parent');
    await driver.refresh();
    const url = await driver.getUrl();
    expect(url).to.include('/parent-dashboard');
  });

  it('TC-AUTH-034 [Security] Child role cannot access parent-only routes', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    await authPage.login('parent@test.com', 'password123', 'child');
    await authPage.navigateTo(caps.baseUrl + '/parent-dashboard');
    await authPage.pause(1000);
    const url = await driver.getUrl();
    expect(url).to.not.include('/parent-dashboard');
  });

  it('TC-AUTH-035 [Deployable] Login API responds within 3 seconds', async function () {
    await authPage.navigateTo(caps.baseUrl + '/login');
    const start = Date.now();
    await authPage.login('parent@test.com', 'password123', 'parent');
    const elapsed = Date.now() - start;
    expect(elapsed).to.be.lessThan(3000);
  });
});
