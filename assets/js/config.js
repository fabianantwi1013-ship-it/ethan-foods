/* Ethan Foods — site configuration.
   orderWebhook: URL of the Google Apps Script web app that receives website
   orders and stores them in a Google Sheet (see GOOGLE-SHEET-SETUP.md).
   Leave empty ("") and the site still works — orders just stay in the
   customer's browser only. */
window.EF_CONFIG = {
  orderWebhook: "https://script.google.com/macros/s/AKfycbwPpwcn1H1Vtp30DZFCLd71AnDvDbsX9_9FKKW0Z860XS6iO1KyyscnNzjA1kqQy7Cs/exec"
};
