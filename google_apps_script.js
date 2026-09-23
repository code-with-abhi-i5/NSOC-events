/**
 * ==============================================================================
 * NSOC 2026 — 100% FREE Google Apps Script Email Dispatcher & Logger
 * ==============================================================================
 * 
 * HOW TO DEPLOY THIS IN 2 MINUTES:
 * 1. Open Google Sheets (https://sheets.new) and name it "NSOC 2026 Dispatches"
 * 2. Click "Extensions" > "Apps Script" in the top menu
 * 3. Delete any code in the editor, and PASTE this entire file
 * 4. Click "Deploy" (top right button) > "New deployment"
 * 5. Click the gear icon (Select type) > Choose "Web app"
 * 6. Set Description: "NSOC Email Dispatcher"
 * 7. Set "Execute as": "Me (<your email>)"
 * 8. Set "Who has access": "Anyone"  <-- IMPORTANT!
 * 9. Click "Deploy" and authorize permissions when prompted
 * 10. COPY the "Web app URL" (looks like https://script.google.com/macros/s/AKfycb.../exec)
 * 11. Paste this URL into your NSOC Admin Panel > Settings Page!
 * ==============================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "online", service: "NSOC 2026 Email Dispatcher" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);

    var name = data.recipientName || "Participant";
    var email = data.recipientEmail;
    var teamName = data.teamName || "";
    var certId = data.certificateId || "NSOC26-OFFICIAL";
    var certType = data.certificateType || "Certificate of Recognition";
    var verifyUrl = data.verificationUrl || "https://nsoc-events.vercel.app";

    if (!email) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Missing recipientEmail" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var subject = "Your Official NSOC 2026 Certificate is Ready — " + name;

    var htmlBody = 
      "<div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 580px; margin: 0 auto;'>" +
        "<div style='text-align: center; margin-bottom: 28px;'>" +
          "<span style='background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;'>Official Credential</span>" +
          "<h1 style='color: #ffffff; font-size: 24px; margin: 12px 0 4px 0; letter-spacing: -0.5px;'>NSOC 2026</h1>" +
          "<p style='color: #94a3b8; font-size: 13px; margin: 0;'>National Students Open-Source Conference</p>" +
        "</div>" +

        "<div style='background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 24px; margin-bottom: 24px;'>" +
          "<p style='font-size: 15px; color: #e2e8f0; margin-top: 0;'>Dear <strong>" + name + "</strong>,</p>" +
          "<p style='font-size: 14px; color: #cbd5e1; line-height: 1.6;'>" +
            "Congratulations on your outstanding contribution to <strong>NSOC 2026</strong>. " +
            "Your official digital certificate has been issued and anchored in our authoritative verification registry." +
          "</p>" +

          "<div style='background: #1e293b; border-left: 4px solid #6366f1; border-radius: 6px; padding: 14px 18px; margin: 20px 0;'>" +
            "<div style='font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;'>Certificate Identifier</div>" +
            "<div style='font-size: 20px; font-family: monospace; font-weight: bold; color: #facc15; margin-top: 2px;'>" + certId + "</div>" +
            (teamName ? "<div style='font-size: 12px; color: #38bdf8; margin-top: 4px;'>Team: " + teamName + "</div>" : "") +
            "<div style='font-size: 12px; color: #cbd5e1; margin-top: 2px;'>Category: " + certType + "</div>" +
          "</div>" +

          "<div style='text-align: center; margin: 28px 0 10px 0;'>" +
            "<a href='" + verifyUrl + "' style='background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; padding: 14px 32px; font-size: 14px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);'>" +
              "View & Download Certificate" +
            "</a>" +
          "</div>" +
        "</div>" +

        "<p style='font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;'>" +
          "This is an automated dispatch from the official NSOC 2026 platform.<br/>" +
          "Verification URL: " + verifyUrl +
        "</p>" +
      "</div>";

    // Send email using native Gmail quota
    GmailApp.sendEmail(email, subject, "Your certificate ID: " + certId + " - Verify at: " + verifyUrl, {
      htmlBody: htmlBody,
      name: "NSOC 2026 Credentials"
    });

    // Automatically log into active sheet
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Recipient Name", "Email", "Team", "Category", "Certificate ID", "Status"]);
      }
      sheet.appendRow([new Date(), name, email, teamName, certType, certId, "DELIVERED"]);
    } catch (sheetErr) {
      Logger.log("Sheet log notice: " + sheetErr);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, email: email, certificateId: certId })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
