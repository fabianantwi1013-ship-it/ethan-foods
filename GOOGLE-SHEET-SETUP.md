# Online order inbox — Google Sheet setup (~5 minutes)

This makes every website order (from ANY customer's phone or computer) land in a
Google Sheet, and the dashboard's **Website Orders** page reads from it automatically.

## 1. Create the sheet
1. Go to **sheets.new** (logged into the Google account that should own the orders)
2. Name it **Ethan Foods Orders**

## 2. Add the script
1. In the sheet: **Extensions → Apps Script**
2. Delete whatever is in the editor and paste ALL of this:

```javascript
// Ethan Foods order bridge
var KEY = "CHANGE-ME-TO-A-PASSWORD";   // <-- pick any secret word, e.g. "ginger-2026"

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Orders") || ss.insertSheet("Orders");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Received", "Order no", "Placed", "Name", "Phone", "Email",
                     "Address", "Note", "Items JSON", "Total"]);
  }
  var o = JSON.parse(e.postData.contents);
  var c = o.customer || {};
  sheet.appendRow([new Date(), o.no, o.date, c.name, c.phone, c.email,
                   c.address, c.note, JSON.stringify(o.items || []), o.total]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if ((e.parameter.key || "") !== KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "bad key" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
  var rows = sheet ? sheet.getDataRange().getValues().slice(1) : [];
  var orders = rows.map(function (r) {
    var items = [];
    try { items = JSON.parse(r[8] || "[]"); } catch (err) {}
    return { no: String(r[1]), date: r[2], status: "New",
             customer: { name: r[3], phone: String(r[4]), email: r[5],
                         address: r[6], note: r[7] },
             items: items, total: Number(r[9]) || 0 };
  });
  return ContentService.createTextOutput(JSON.stringify({ orders: orders }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Change `CHANGE-ME-TO-A-PASSWORD` to your own secret word. **Remember it.**
4. Click the 💾 save icon.

## 3. Publish it
1. **Deploy → New deployment**
2. Click the ⚙️ gear → **Web app**
3. Settings: *Execute as* = **Me** · *Who has access* = **Anyone**
4. Click **Deploy**, approve the permissions Google asks for
   (it warns because it's your own script — click Advanced → Go to project)
5. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`)

## 4. Connect the site
1. Give the Web app URL to Claude (or paste it yourself into
   `assets/js/config.js` as `orderWebhook`) and push/redeploy the site
2. Open the dashboard → **Website Orders** → **🔑 Connect sync** → type your secret word
   (it's saved in the owner's browser only — never in the public site code)

Done. New website orders appear in the Google Sheet instantly and in the
dashboard within 2 minutes (or instantly with **Sync now**).

**Security notes**
- The secret word only protects *reading* orders. Don't share it.
- The sheet is the real record — the dashboard is a view of it.
- To rotate the secret: change `KEY` in Apps Script → Deploy → Manage deployments → Edit → Version: New → Deploy.
