/* Ethan Foods — site configuration.
   orderWebhook: URL of the Google Apps Script web app that receives website
   orders and stores them in a Google Sheet (see GOOGLE-SHEET-SETUP.md).
   Leave empty ("") and the site still works — orders just stay in the
   customer's browser only. */
window.EF_CONFIG = {
  orderWebhook: ""
};
