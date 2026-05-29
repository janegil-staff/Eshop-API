// Your Mac's LAN IP so the iPhone can reach the dev server.
// Find it with: ipconfig getifaddr en0
const API_HOST = 'http://192.168.1.100:3000';

export const ENV = {
  API_URL: `${API_HOST}/api`,
  STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE_ME',
  APPLE_MERCHANT_ID: 'merchant.com.qupda.estore',
  MERCHANT_NAME: 'eStore',
};