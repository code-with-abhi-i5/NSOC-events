// Serverless Backend Endpoint for Vercel
// This runs strictly on the server - no API credentials or Google Apps Script URLs are exposed to the browser.

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { recipientName, recipientEmail, teamName, certificateId, certificateType, verificationUrl } = req.body || {};

    if (!recipientEmail) {
      return res.status(400).json({ error: "Missing required parameter: recipientEmail." });
    }

    // Server-side secret environment variable (never leaked to browser)
    const webhookUrl =
      process.env.GAS_WEBHOOK_URL ||
      process.env.VITE_GAS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbwI6wjX5MGYuG7Zs8z_8PiM2TmxyXrMUTNAtg_NEnGMYjKI7Xo7x_oYvk03q_vFgMM7/exec";

    const payload = {
      recipientName: recipientName || "Participant",
      recipientEmail: recipientEmail,
      teamName: teamName || "",
      certificateId: certificateId || "NSOC26-OFFICIAL",
      certificateType: certificateType || "Certificate of Recognition",
      verificationUrl: verificationUrl || "https://nsoc-events.vercel.app",
    };

    // Server-to-Server dispatch (Hidden from browser Network tab)
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { status: "dispatched", raw: responseText };
    }

    return res.status(200).json({
      success: true,
      message: `Email dispatched securely to ${recipientEmail}`,
      result: responseData,
    });
  } catch (error) {
    console.error("Backend Serverless Dispatch Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to dispatch email from serverless backend.",
    });
  }
}
