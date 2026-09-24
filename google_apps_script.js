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

    var subject = "Official CODE-A-THON 2.0 Certificate: " + name + " [" + certId + "]";

    // 1. Generate QR Code URL
    var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=" + encodeURIComponent(verifyUrl) + "&bgcolor=ffffff&color=0c1a3a";

    // 2. Generate CODE-A-THON 2.0 Landscape PDF Certificate
    var attachments = [];
    var safeFileName = (name.replace(/[^a-zA-Z0-9]/g, "_") || "Participant") + "_CodeAThon_Certificate.pdf";

    try {
      var certLabelSub = certType ? certType.toUpperCase() : "OF PARTICIPATION";
      if (!certLabelSub.startsWith("OF ")) {
        certLabelSub = "OF " + certLabelSub;
      }

      var certPdfHtml = 
        "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
        "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
        "<title>CODE-A-THON 2.0 Certificate</title>" +
        "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap' rel='stylesheet'>" +
        "<style>" +
        "  @page { size: 297mm 210mm; margin: 0mm; }" +
        "  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }" +
        "  html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }" +
        "  .cert { position: relative; width: 100%; height: 100%; min-height: 200mm; background: #ffffff; overflow: hidden; display: flex; flex-direction: column; padding: 26px 48px 20px 48px; color: #0c1a3a; box-sizing: border-box; justify-content: space-between; }" +
        "  .wave { position: absolute; z-index: 1; pointer-events: none; }" +
        "  .wave.tr { top: 0; right: 0; width: 280px; }" +
        "  .wave.bl { bottom: 0; left: 0; width: 280px; }" +
        "  .logos { display: flex; align-items: center; justify-content: space-between; gap: 16px; position: relative; z-index: 5; }" +
        "  .logos img { max-height: 34px; width: auto; object-fit: contain; }" +
        "  .event { text-align: center; margin-top: 24px; position: relative; z-index: 5; }" +
        "  .event h1 { font-size: 54px; font-weight: 900; letter-spacing: 2px; color: #0c1a3a; line-height: 1; text-transform: uppercase; }" +
        "  .event h1 .v2 { background: linear-gradient(135deg, #1d4ed8, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #2563eb; font-style: italic; }" +
        "  .event .subtitle { font-size: 11px; font-weight: 700; letter-spacing: 4px; color: #2563eb; margin-top: 8px; text-transform: uppercase; }" +
        "  .label { text-align: center; margin-top: 22px; position: relative; z-index: 5; }" +
        "  .label h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #0c1a3a; text-transform: uppercase; line-height: 1; }" +
        "  .label .sub { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 6px; }" +
        "  .label .sub .line { width: 55px; height: 2px; background: #ea580c; display: inline-block; vertical-align: middle; }" +
        "  .label .sub span { font-size: 13px; font-weight: 800; letter-spacing: 6px; color: #ea580c; text-transform: uppercase; }" +
        "  .recipient { text-align: center; margin-top: 18px; position: relative; z-index: 5; }" +
        "  .recipient .pre { font-size: 13px; color: #64748b; margin-bottom: 6px; }" +
        "  .recipient .name { font-family: 'Playfair Display', Georgia, serif; font-size: 46px; font-weight: 800; color: #0c1a3a; letter-spacing: 1px; line-height: 1.1; }" +
        (teamName ? "  .recipient .team { font-size: 13px; font-weight: 700; color: #2563eb; margin-top: 4px; }" : "") +
        "  .desc { text-align: center; font-size: 13px; line-height: 1.7; color: #475569; max-width: 740px; margin: 14px auto 0 auto; position: relative; z-index: 5; }" +
        "  .desc strong { color: #0c1a3a; font-weight: 700; }" +
        "  .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 16px; position: relative; z-index: 5; gap: 20px; }" +
        "  .sig { text-align: center; flex: 1; min-width: 170px; }" +
        "  .sig .sign { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 22px; color: #0c1a3a; margin-bottom: 2px; height: 30px; }" +
        "  .sig .line { width: 170px; height: 1px; background: #94a3b8; margin: 0 auto 6px auto; }" +
        "  .sig .name { font-size: 12px; font-weight: 800; color: #0c1a3a; letter-spacing: 0.5px; text-transform: uppercase; }" +
        "  .sig .role { font-size: 9px; color: #64748b; letter-spacing: 0.5px; margin-top: 2px; }" +
        "  .qr { text-align: center; flex-shrink: 0; }" +
        "  .qr img { width: 72px; height: 72px; padding: 2px; background: #fff; border: 1px solid #cbd5e1; border-radius: 5px; display: block; margin: 0 auto; }" +
        "  .qr .cert-id { font-family: monospace; font-size: 9px; font-weight: 700; color: #0c1a3a; margin-top: 4px; letter-spacing: 0.5px; }" +
        "  .qr .scan { font-size: 8px; font-weight: 700; letter-spacing: 1.2px; color: #3b82f6; text-transform: uppercase; margin-top: 2px; }" +
        "</style></head><body>" +
        "<div class='cert'>" +
        "  <svg class='wave tr' viewBox='0 0 280 240' xmlns='http://www.w3.org/2000/svg'>" +
        "    <path d='M280,0 L280,240 C230,230 170,190 130,140 C90,90 60,50 0,15 L0,0 Z' fill='#1e3a8a' opacity='0.9'/>" +
        "    <path d='M280,0 L280,200 C235,190 180,155 145,110 C110,65 80,35 20,8 L0,0 Z' fill='#facc15' opacity='0.85'/>" +
        "  </svg>" +
        "  <svg class='wave bl' viewBox='0 0 280 240' xmlns='http://www.w3.org/2000/svg'>" +
        "    <path d='M0,240 L0,0 C50,10 110,50 150,100 C190,150 220,190 280,225 L280,240 Z' fill='#1e3a8a' opacity='0.9'/>" +
        "    <path d='M0,240 L0,40 C45,50 100,85 135,130 C170,175 200,205 260,232 L280,240 Z' fill='#facc15' opacity='0.85'/>" +
        "  </svg>" +
        "  <div class='logos'>" +
        "    <img src='https://avatars.githubusercontent.com/u/264619437?s=280' alt='Nexus' style='max-height: 38px; width: auto; border-radius: 4px;'>" +
        "    <img src='https://placehold.co/100x36/ffffff/0c1a3a?text=Sigma+Fusion&font=roboto' alt='Sigma Fusion'>" +
        "    <img src='https://placehold.co/100x36/ffffff/0c1a3a?text=Meander&font=roboto' alt='Meander'>" +
        "    <img src='https://placehold.co/100x36/ffffff/0c1a3a?text=DSO&font=roboto' alt='DSO'>" +
        "    <img src='https://placehold.co/100x36/ffffff/0c1a3a?text=MACBEASE&font=roboto' alt='Macbease'>" +
        "  </div>" +
        "  <div class='event'>" +
        "    <h1>CODE-A-THON <span class='v2'>2.0</span></h1>" +
        "    <div class='subtitle'>24-Hour Hackathon</div>" +
        "  </div>" +
        "  <div class='label'>" +
        "    <h2>Certificate</h2>" +
        "    <div class='sub'>" +
        "      <span class='line'></span>" +
        "      <span>" + certLabelSub + "</span>" +
        "      <span class='line'></span>" +
        "    </div>" +
        "  </div>" +
        "  <div class='recipient'>" +
        "    <div class='pre'>This certificate is proudly presented to</div>" +
        "    <div class='name'>" + name + "</div>" +
        (teamName ? "<div class='team'>Team: " + teamName + "</div>" : "") +
        "  </div>" +
        "  <div class='desc'>" +
        "    for actively participating in <strong>CODE-A-THON 2.0 – 24-Hour Hackathon</strong>, organized by <strong>Nexus Spring of Code</strong> in collaboration with <strong>Sigma Fusion</strong>, <strong>Meander</strong>, <strong>DSO</strong>, and <strong>Macbease</strong>, held on <strong>25–26 September 2026</strong>." +
        "  </div>" +
        "  <div class='footer'>" +
        "    <div class='sig'>" +
        "      <div class='sign'>Aman Singh</div>" +
        "      <div class='line'></div>" +
        "      <div class='name'>Aman Singh</div>" +
        "      <div class='role'>Founder, Nexus Spring of Code</div>" +
        "    </div>" +
        "    <div class='qr'>" +
        "      <img src='" + qrUrl + "' alt='QR'>" +
        "      <div class='cert-id'>" + certId + "</div>" +
        "      <div class='scan'>Scan to Verify</div>" +
        "    </div>" +
        "    <div class='sig'>" +
        "      <div class='sign'>R. K. Sharma</div>" +
        "      <div class='line'></div>" +
        "      <div class='name'>Dr. R. K. Sharma</div>" +
        "      <div class='role'>Dean, Student Welfare</div>" +
        "    </div>" +
        "  </div>" +
        "</div></body></html>";

      var pdfBlob = Utilities.newBlob(certPdfHtml, "text/html", "certificate.html")
        .getAs("application/pdf")
        .setName(safeFileName);

      attachments.push(pdfBlob);
    } catch (pdfErr) {
      Logger.log("PDF Generation Notice: " + pdfErr);
    }

    // 3. Email Body (HTML)
    // 3. Email Body (Ultra-Premium HTML, Zero Character Encoding Issues)
    var htmlBody = 
      "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color: #060913; margin: 0; padding: 30px 10px; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
      "  <tr>" +
      "    <td align='center'>" +
      "      <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width: 600px; background-color: #0d1527; border-radius: 16px; border: 1px solid #1e2e4a; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);'>" +

      "        <!-- Top Header & Branding -->" +
      "        <tr>" +
      "          <td style='background: linear-gradient(135deg, #090e1a 0%, #1e3a8a 50%, #090e1a 100%); padding: 36px 30px 28px 30px; text-align: center; border-bottom: 1px solid #1e3a8a;'>" +
      "            <div style='margin-bottom: 14px;'>" +
      "              <img src='https://avatars.githubusercontent.com/u/264619437?s=280' width='54' height='54' alt='Nexus' style='border-radius: 12px; border: 2px solid rgba(255,255,255,0.25); display: inline-block; vertical-align: middle;' />" +
      "            </div>" +
      "            <div>" +
      "              <span style='display: inline-block; background-color: rgba(37, 99, 235, 0.25); border: 1px solid #3b82f6; color: #93c5fd; font-size: 11px; font-weight: 800; letter-spacing: 2px; padding: 4px 14px; border-radius: 50px; text-transform: uppercase;'>" +
      "                Official Digital Credential" +
      "              </span>" +
      "            </div>" +
      "            <h1 style='color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 1px; margin: 16px 0 6px 0; text-transform: uppercase; line-height: 1.1;'>" +
      "              CODE-A-THON <span style='color: #60a5fa;'>2.0</span>" +
      "            </h1>" +
      "            <p style='color: #94a3b8; font-size: 13px; font-weight: 600; letter-spacing: 2px; margin: 0; text-transform: uppercase;'>" +
      "              24-Hour Hackathon | Nexus Spring of Code" +
      "            </p>" +
      "          </td>" +
      "        </tr>" +

      "        <!-- Main Content -->" +
      "        <tr>" +
      "          <td style='padding: 32px 30px;'>" +
      "            <p style='color: #f1f5f9; font-size: 17px; font-weight: 700; margin: 0 0 14px 0;'>" +
      "              Dear " + name + "," +
      "            </p>" +
      "            <p style='color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;'>" +
      "              Congratulations on your outstanding performance in <strong>CODE-A-THON 2.0 (24-Hour Hackathon)</strong> organized by <strong>Nexus Spring of Code</strong> in collaboration with <strong>Sigma Fusion, Meander, DSO, and Macbease</strong>. Your dedication and technical innovation have been officially verified and recorded." +
      "            </p>" +

      "            <!-- Credential Info Box -->" +
      "            <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color: #111a2e; border: 1px solid #1e2e4a; border-radius: 12px; margin-bottom: 24px; overflow: hidden;'>" +
      "              <tr>" +
      "                <td style='padding: 20px;'>" +
      "                  <div style='font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;'>" +
      "                    Certificate Identifier" +
      "                  </div>" +
      "                  <div style='font-size: 22px; font-family: monospace; font-weight: 900; color: #fbbf24; letter-spacing: 1px; margin-bottom: 16px;'>" +
      certId +
      "                  </div>" +

      "                  <table role='presentation' width='100%' cellpadding='4' cellspacing='0' border='0' style='font-size: 13px; border-top: 1px solid #1e2e4a; padding-top: 12px;'>" +
      "                    <tr>" +
      "                      <td style='color: #94a3b8; width: 35%; padding: 6px 0;'>Recipient:</td>" +
      "                      <td style='color: #ffffff; font-weight: 700; padding: 6px 0;'>" + name + "</td>" +
      "                    </tr>" +
      (teamName ? "                    <tr><td style='color: #94a3b8; padding: 6px 0;'>Team:</td><td style='color: #38bdf8; font-weight: 700; padding: 6px 0;'>" + teamName + "</td></tr>" : "") +
      "                    <tr>" +
      "                      <td style='color: #94a3b8; padding: 6px 0;'>Category:</td>" +
      "                      <td style='color: #e2e8f0; font-weight: 600; padding: 6px 0;'>" + certType + "</td>" +
      "                    </tr>" +
      "                    <tr>" +
      "                      <td style='color: #94a3b8; padding: 6px 0;'>Status:</td>" +
      "                      <td style='color: #34d399; font-weight: 700; padding: 6px 0;'>Active &amp; Authenticated</td>" +
      "                    </tr>" +
      "                  </table>" +
      "                </td>" +
      "              </tr>" +
      "            </table>" +

      "            <!-- PDF Attachment Highlight Banner -->" +
      "            <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; margin-bottom: 28px;'>" +
      "              <tr>" +
      "                <td style='padding: 14px 18px;'>" +
      "                  <span style='display: inline-block; background-color: #059669; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-right: 8px;'>" +
      "                    PDF Attached" +
      "                  </span>" +
      "                  <strong style='color: #34d399; font-size: 13px;'>Official Landscape Certificate Included</strong>" +
      "                  <p style='color: #94a3b8; font-size: 12px; margin: 4px 0 0 0; line-height: 1.5;'>" +
      "                    Your high-resolution PDF certificate with digital signatures and QR verification is attached directly to this email." +
      "                  </p>" +
      "                </td>" +
      "              </tr>" +
      "            </table>" +

      "            <!-- CTA Button -->" +
      "            <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='margin-bottom: 24px;'>" +
      "              <tr>" +
      "                <td align='center'>" +
      "                  <a href='" + verifyUrl + "' style='background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; display: inline-block; text-transform: uppercase; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45); border: 1px solid #3b82f6;'>" +
      "                    Verify Certificate Online" +
      "                  </a>" +
      "                </td>" +
      "              </tr>" +
      "            </table>" +

      "            <p style='color: #64748b; font-size: 11px; text-align: center; margin: 0; line-height: 1.6;'>" +
      "              Direct Verification URL:<br />" +
      "              <a href='" + verifyUrl + "' style='color: #38bdf8; text-decoration: underline; word-break: break-all;'>" + verifyUrl + "</a>" +
      "            </p>" +
      "          </td>" +
      "        </tr>" +

      "        <!-- Signatures & Partners Footer -->" +
      "        <tr>" +
      "          <td style='background-color: #080d19; padding: 24px 30px; border-top: 1px solid #1e293b; text-align: center;'>" +
      "            <p style='font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0 0 8px 0;'>" +
      "              <strong style='color: #e2e8f0;'>Nexus Spring of Code</strong> | " +
      "              In collaboration with <strong style='color: #cbd5e1;'>Sigma Fusion, Meander, DSO, Macbease</strong>" +
      "            </p>" +
      "            <p style='font-size: 10px; color: #64748b; margin: 0 0 12px 0;'>" +
      "              Signatories: Aman Singh (Founder) &bull; Dr. R. K. Sharma (Dean, Student Welfare)" +
      "            </p>" +
      "            <p style='color: #475569; font-size: 10px; margin: 0; line-height: 1.5;'>" +
      "              Automated credential dispatch from the official NSOC verification registry.<br />" +
      "              All rights reserved &copy; 2026 Nexus Spring of Code." +
      "            </p>" +
      "          </td>" +
      "        </tr>" +

      "      </table>" +
      "    </td>" +
      "  </tr>" +
      "</table>";

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


