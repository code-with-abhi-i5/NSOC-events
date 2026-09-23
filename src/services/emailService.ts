export interface EmailPayload {
  recipientName: string;
  recipientEmail: string;
  teamName?: string;
  certificateId: string;
  certificateType: string;
  verificationUrl: string;
}

export const emailService = {
  /**
   * Securely dispatches email via server-side backend endpoint (/api/send-email).
   * No API credentials, webhook URLs, or sensitive tokens are exposed to the client browser.
   */
  async sendViaAppsScript(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      return {
        success: true,
        message: `Email dispatched to ${payload.recipientEmail} via secure server backend!`,
      };
    } catch (err: any) {
      console.error("Email dispatch error:", err);
      return {
        success: false,
        message: err?.message || "Failed to trigger serverless email backend.",
      };
    }
  },

  async sendBatch(items: EmailPayload[]): Promise<{ total: number; sent: number }> {
    let sent = 0;
    for (const item of items) {
      const res = await this.sendViaAppsScript(item);
      if (res.success) sent++;
      // Small pause to prevent burst limits
      await new Promise((r) => setTimeout(r, 250));
    }
    return { total: items.length, sent };
  },
};
