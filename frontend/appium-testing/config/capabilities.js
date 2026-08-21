/**
 * Appium Desired Capabilities & Server Configuration for Android Mobile Testing
 */

module.exports = {
  // Appium Server Connection Settings
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/'
  },

  // Android Mobile Capabilities for Web/PWA Application Testing
  androidChromeCapabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_VERSION || '11.0',
    browserName: 'Chrome',
    'appium:newCommandTimeout': 300,
    'appium:chromedriverAutodownload': true,
    'appium:noReset': false
  },

  // Android Mobile Capabilities for Native APK / Hybrid App Testing
  androidNativeCapabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_VERSION || '11.0',
    'appium:app': process.env.APK_PATH || './app-release.apk',
    'appium:appPackage': 'com.smartchild.ai',
    'appium:appActivity': '.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true
  },

  // Target Mobile Web URL for Testing
  baseUrl: process.env.APP_URL || 'http://10.109.226.210:5173'
};
