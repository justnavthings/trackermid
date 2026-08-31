/**
 * EXAM QUEST — Google Sheets backend
 *
 * This is a Google Apps Script "Web App" that acts as the save/load
 * endpoint for the site. Each signed-in user gets one row in the
 * sheet, keyed by their Google email. The whole app state (topics +
 * theme) is stored as a single JSON blob in that row.
 *
 * SETUP:
 * 1. Create (or open) a Google Sheet — this will hold the data.
 * 2. In the Sheet, go to Extensions → Apps Script.
 * 3. Delete any placeholder code and paste this entire file in.
 * 4. Click Deploy → New deployment → select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Click Deploy, authorize the permissions it asks for, and copy
 *    the generated Web app URL (ends in /exec).
 * 6. Paste that URL into CONFIG.SHEETS_WEBAPP_URL near the top of
 *    the <script> tag in exam-quest.html.
 *
 * NOTE ON SECURITY: this endpoint is intentionally simple — it
 * trusts the email sent to it rather than re-verifying the Google
 * token server-side. That's fine for a personal / small-group study
 * tracker, but do not use this pattern for anything sensitive.
 */

const SHEET_NAME = "ExamQuestData";

function doGet(e) {
  const email = e.parameter.email;
  if (!email) return jsonOut({ error: "missing email" });

  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === email) {
      try {
        return jsonOut(JSON.parse(rows[i][1]));
      } catch (err) {
        return jsonOut({});
      }
    }
  }
  return jsonOut({}); // no saved data yet for this user
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const email = body.email;
  const name = body.name || "";
  if (!email) return jsonOut({ ok: false, error: "missing email" });

  const payload = JSON.stringify(body.data || {});
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === email) { rowIndex = i + 1; break; } // +1: sheet rows are 1-indexed
  }

  if (rowIndex === -1) {
    sheet.appendRow([email, payload, name, new Date()]);
  } else {
    sheet.getRange(rowIndex, 2).setValue(payload);
    sheet.getRange(rowIndex, 3).setValue(name);
    sheet.getRange(rowIndex, 4).setValue(new Date());
  }

  return jsonOut({ ok: true });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["email", "data_json", "name", "updated_at"]);
  }
  return sheet;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
