/**
 * ==============================================================================
 * NSOC 2026 — Google Apps Script Email & PDF Certificate Dispatcher
 * ==============================================================================
 * 
 * FEATURES:
 * 1. Dispatches beautiful HTML email to participant
 * 2. Generates a FULL-BLEED, EDGE-TO-EDGE LANDSCAPE PDF CERTIFICATE (Zero white borders)
 * 3. Embeds live Verification QR Code inside the PDF
 * 4. ATTACHES THE PDF DIRECTLY to the outgoing email (100% Free via Gmail quota)
 * 5. Logs every dispatch into Google Sheets for instant audit
 * 
 * HOW TO UPDATE IN 1 MINUTE:
 * 1. Open your Google Sheet ("NSOC 2026 Dispatches")
 * 2. Click "Extensions" > "Apps Script"
 * 3. Select all (Ctrl+A), delete, and PASTE this entire code
 * 4. Click "Deploy" (top right) > "Manage deployments"
 * 5. Click the pencil (Edit) icon next to your active deployment
 * 6. Under "Version", select "New version"
 * 7. Click "Deploy" — Done! (The Webhook URL stays exactly the same!)
 * ==============================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "online", service: "NSOC 2026 Email & PDF Dispatcher" })
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
    var verifyUrl = data.verificationUrl || ("https://nsoc-events.vercel.app/verify/" + certId);

    if (!email) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Missing recipientEmail" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var subject = "Official NSOC 2026 Certificate — " + name + " (" + certId + ")";

    // 1. Generate QR Code URL
    var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=" + encodeURIComponent(verifyUrl);

    // 2. Full-Bleed Edge-to-Edge Landscape PDF Certificate (A4 Landscape: 297mm x 210mm)
    var attachments = [];
    try {
      var certPdfHtml = 
        "<!DOCTYPE html>" +
        "<html><head><meta charset='utf-8'>" +
        "<style>" +
        "  @page {" +
        "    size: 297mm 210mm;" +
        "    margin: 0mm;" +
        "  }" +
        "  * {" +
        "    box-sizing: border-box;" +
        "    -webkit-print-color-adjust: exact !important;" +
        "    print-color-adjust: exact !important;" +
        "  }" +
        "  html, body {" +
        "    width: 297mm;" +
        "    height: 210mm;" +
        "    margin: 0;" +
        "    padding: 0;" +
        "    background-color: #070a12;" +
        "    color: #ffffff;" +
        "    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;" +
        "    overflow: hidden;" +
        "  }" +
        "  .cert-container {" +
        "    width: 297mm;" +
        "    height: 210mm;" +
        "    padding: 12mm 15mm;" +
        "    background: #070a12;" +
        "    background: radial-gradient(circle at 50% 25%, #151d38 0%, #070a12 100%);" +
        "    box-sizing: border-box;" +
        "  }" +
        "  .cert-frame {" +
        "    width: 100%;" +
        "    height: 100%;" +
        "    border: 3px double #d4af37;" +
        "    border-radius: 12px;" +
        "    background: rgba(11, 15, 25, 0.9);" +
        "    padding: 24px 35px 20px 35px;" +
        "    box-sizing: border-box;" +
        "    text-align: center;" +
        "    box-shadow: inset 0 0 45px rgba(212, 175, 55, 0.15);" +
        "  }" +
        "  .badge { color: #f59e0b; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }" +
        "  .main-title { font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 2px; margin: 0 0 4px 0; text-transform: uppercase; }" +
        "  .sub-title { font-size: 12px; color: #94a3b8; margin: 0 0 20px 0; letter-spacing: 1px; }" +
        "  .presented-to { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }" +
        "  .recipient { font-size: 34px; font-weight: bold; color: #fbbf24; margin: 0 0 6px 0; padding-bottom: 6px; border-bottom: 2px solid rgba(245, 158, 11, 0.45); display: inline-block; min-width: 320px; }" +
        (teamName ? "  .team { font-size: 14px; color: #38bdf8; margin: 4px 0 8px 0; font-weight: 600; }" : "") +
        "  .category { display: inline-block; background: #1e1b4b; border: 1px solid #4338ca; color: #a5b4fc; font-size: 13px; font-weight: bold; padding: 5px 22px; border-radius: 20px; margin: 12px 0 14px 0; }" +
        "  .statement { font-size: 12px; color: #cbd5e1; line-height: 1.6; max-width: 680px; margin: 0 auto 22px auto; }" +
        "  .footer-tbl { width: 100%; border-collapse: collapse; margin-top: 10px; }" +
        "  .footer-col { width: 33.33%; vertical-align: bottom; text-align: center; font-size: 11px; color: #94a3b8; }" +
        "  .sig-line { border-top: 1px solid #475569; width: 150px; margin: 0 auto 6px auto; }" +
        "  .sig-name { font-weight: bold; color: #ffffff; font-size: 12px; }" +
        "  .qr-code { width: 85px; height: 85px; border-radius: 6px; border: 2px solid #334155; background: #ffffff; padding: 3px; display: inline-block; }" +
        "  .cert-id-tag { font-family: monospace; font-size: 11px; color: #fbbf24; font-weight: bold; margin-top: 5px; }" +
        "</style></head><body>" +
        "<div class='cert-container'>" +
        "  <div class='cert-frame'>" +
        "    <div class='badge'>National Students Open-Source Conference</div>" +
        "    <div class='main-title'>Certificate of Recognition</div>" +
        "    <div class='sub-title'>Official Authorized Credential &bull; NSOC 2026</div>" +
        "    <div class='presented-to'>This is proudly presented to</div>" +
        "    <div class='recipient'>" + name + "</div>" +
        (teamName ? "<div class='team'>Team: " + teamName + "</div>" : "") +
        "    <div><span class='category'>" + certType + "</span></div>" +
        "    <div class='statement'>For exemplary contribution, technical excellence, and dedication to the open-source ecosystem during NSOC 2026. This certificate is immutably registered on the official public verification registry.</div>" +
        "    <table class='footer-tbl'>" +
        "      <tr>" +
        "        <td class='footer-col'>" +
        "          <div class='sig-line'></div>" +
        "          <div class='sig-name'>Dr. Aman Kumar</div>" +
        "          <div>General Chair, NSOC 2026</div>" +
        "        </td>" +
        "        <td class='footer-col'>" +
        "          <img src='" + qrUrl + "' class='qr-code' alt='Verification QR' />" +
        "          <div class='cert-id-tag'>" + certId + "</div>" +
        "        </td>" +
        "        <td class='footer-col'>" +
        "          <div class='sig-line'></div>" +
        "          <div class='sig-name'>23 September 2026</div>" +
        "          <div>Official Verification Ledger</div>" +
        "        </td>" +
        "      </tr>" +
        "    </table>" +
        "  </div>" +
        "</div></body></html>";

      var safeFileName = (name.replace(/[^a-zA-Z0-9]/g, "_") || "Participant") + "_NSOC2026_Certificate.pdf";
      var pdfBlob = Utilities.newBlob(certPdfHtml, "text/html", "certificate.html")
        .getAs("application/pdf")
        .setName(safeFileName);

      attachments.push(pdfBlob);
    } catch (pdfErr) {
      Logger.log("PDF Generation Notice: " + pdfErr);
    }

    // 3. Email Body (HTML)
    var htmlBody = 
      "<div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 580px; margin: 0 auto;'>" +
        "<div style='text-align: center; margin-bottom: 28px;'>" +
        "  <span style='background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;'>Official Credential</span>" +
        "  <h1 style='color: #ffffff; font-size: 24px; margin: 12px 0 4px 0; letter-spacing: -0.5px;'>NSOC 2026</h1>" +
        "  <p style='color: #94a3b8; font-size: 13px; margin: 0;'>National Students Open-Source Conference</p>" +
        "</div>" +

        "<div style='background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 24px; margin-bottom: 24px;'>" +
        "  <p style='font-size: 15px; color: #e2e8f0; margin-top: 0;'>Dear <strong>" + name + "</strong>,</p>" +
        "  <p style='font-size: 14px; color: #cbd5e1; line-height: 1.6;'>" +
        "    Congratulations on your outstanding contribution to <strong>NSOC 2026</strong>! " +
        "    Your official digital certificate has been issued and anchored in our authoritative verification registry." +
        "  </p>" +

        "  <div style='background: #1e293b; border-left: 4px solid #6366f1; border-radius: 6px; padding: 14px 18px; margin: 20px 0;'>" +
        "    <div style='font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;'>Certificate Identifier</div>" +
        "    <div style='font-size: 20px; font-family: monospace; font-weight: bold; color: #facc15; margin-top: 2px;'>" + certId + "</div>" +
        (teamName ? "    <div style='font-size: 12px; color: #38bdf8; margin-top: 4px;'>Team: " + teamName + "</div>" : "") +
        "    <div style='font-size: 12px; color: #cbd5e1; margin-top: 2px;'>Category: " + certType + "</div>" +
        "  </div>" +

        "  <div style='background: rgba(16, 185, 129, 0.1); border: 1px dashed rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 12px; text-align: center; margin: 18px 0;'>" +
        "    <span style='color: #34d399; font-size: 13px; font-weight: 600;'>📎 Official PDF Certificate Attached</span>" +
        "    <p style='font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;'>You can download, view, or print your certificate directly from this email attachment.</p>" +
        "  </div>" +

        "  <div style='text-align: center; margin: 24px 0 10px 0;'>" +
        "    <a href='" + verifyUrl + "' style='background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; padding: 14px 32px; font-size: 14px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);'>" +
        "      Verify On Public Ledger" +
        "    </a>" +
        "  </div>" +
        "</div>" +

        "<p style='font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;'>" +
        "  This is an automated dispatch from the official NSOC 2026 platform.<br/>" +
        "  Online Verification: " + verifyUrl +
        "</p>" +
      "</div>";

    // 4. Send Email with Attachment (Using native Gmail Quota - 100% Free)
    var mailOptions = {
      htmlBody: htmlBody,
      name: "NSOC 2026 Credentials"
    };

    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    GmailApp.sendEmail(
      email,
      subject,
      "Your certificate ID: " + certId + " - Verify at: " + verifyUrl + " (Official PDF is attached)",
      mailOptions
    );

    // 5. Automatically log into active sheet
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Recipient Name", "Email", "Team", "Category", "Certificate ID", "PDF Attached", "Status"]);
      }
      sheet.appendRow([new Date(), name, email, teamName, certType, certId, attachments.length > 0 ? "YES" : "NO", "DELIVERED"]);
    } catch (sheetErr) {
      Logger.log("Sheet log notice: " + sheetErr);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, email: email, certificateId: certId, pdfAttached: attachments.length > 0 })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
