export interface EmailPayload {
  recipientName: string;
  recipientEmail: string;
  teamName?: string;
  certificateId: string;
  certificateType: string;
  verificationUrl: string;
}

const GAS_URL_KEY = "nsoc_gas_webhook_url";

export const emailService = {
  getWebhookUrl(): string {
    return (
      localStorage.getItem(GAS_URL_KEY) ||
      import.meta.env.VITE_GAS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbxpTFcCJ5ulQP5-WEe6bUiD4TBl1lGptRtcDTqbBQr2-6Iqd8Z4HL0N9XwfkIvZEiy2/exec"
    );
  },

  setWebhookUrl(url: string) {
    localStorage.setItem(GAS_URL_KEY, url.trim());
  },

  async sendViaAppsScript(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      console.warn("Google Apps Script Webhook URL not set. Simulating dispatch.");
      return {
        success: true,
        message: "Email queued (Simulated: Add your Google Apps Script Webhook URL in Settings to send live from Gmail).",
      };
    }

    try {
      // Google Apps Script Web Apps require mode 'no-cors' to avoid browser cross-origin redirects being blocked
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        message: `Email dispatched to ${payload.recipientEmail} via Google Apps Script (Gmail)!`,
      };
    } catch (err: any) {
      console.error("Apps Script dispatch error:", err);
      return {
        success: false,
        message: err?.message || "Failed to trigger Google Apps Script webhook.",
      };
    }
  },

  async sendBatch(items: EmailPayload[]): Promise<{ total: number; sent: number }> {
    let sent = 0;
    for (const item of items) {
      const res = await this.sendViaAppsScript(item);
      if (res.success) sent++;
      // Small pause to prevent burst limits
      await new Promise((r) => setTimeout(r, 200));
    }
    return { total: items.length, sent };
  },
};
