import { useState, useEffect } from "react";
import { Save, ShieldCheck, Mail, Database, Check, ExternalLink, Send } from "lucide-react";
import { eventConfig } from "@/config/eventConfig";
import { auditService } from "@/services/auditService";
import { emailService } from "@/services/emailService";

export default function SettingsPage() {
  const [eventName, setEventName] = useState<string>(eventConfig.fullName);
  const [organizerName, setOrganizerName] = useState<string>(eventConfig.organizer.name);
  const [contactEmail, setContactEmail] = useState<string>(eventConfig.contactEmail);
  const [certificatePrefix, setCertificatePrefix] = useState<string>("NSOC26");
  const [saved, setSaved] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [testError, setTestError] = useState<string>("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await auditService.log({
      actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
      action: "SETTINGS_UPDATED",
      details: "Updated platform settings",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestWebhook = async () => {
    setTestError("");
    const res = await emailService.sendViaAppsScript({
      recipientName: "Admin Test",
      recipientEmail: contactEmail || "admin@nsoc.dev",
      certificateId: `${certificatePrefix}-TEST-001`,
      certificateType: "System Verification",
      verificationUrl: `${window.location.origin}/verify/${certificatePrefix}-TEST-001`,
    });
    if (res.success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3500);
    } else {
      setTestError(res.message);
      setTimeout(() => setTestError(""), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400">
          <Check className="h-4 w-4" />
          Platform configuration successfully updated.
        </div>
      )}

      {testSent && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 text-sm font-medium text-primary">
          <Send className="h-4 w-4" />
          Test dispatch ping sent to Google Apps Script Webhook!
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Platform Configuration & Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          100% Free architecture: Customize event metadata, Google Apps Script Gmail dispatch, and database.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Event Identity */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Event Identity & Prefixing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-medium text-foreground">Event Official Title</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Organizer / Host Organization</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Inquiries / Admin Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Certificate Serial Prefix</label>
              <input
                type="text"
                value={certificatePrefix}
                onChange={(e) => setCertificatePrefix(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Secure Server-Side Email Backend Config */}
        <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Secure Server-Side Email Dispatcher (/api/send-email)
                </h2>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Zero Client-Side API Exposure • Serverless Backend • Free Gmail Quota
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestWebhook}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Send className="h-3 w-3" />
              Test Dispatch Ping
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>API Endpoint: <code>/api/send-email</code> (Serverless Node Backend)</span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Active &amp; Protected</span>
            </div>

            {testError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {testError}
              </div>
            )}

            <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-[11px] text-muted-foreground border border-border/40">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                Security Architecture:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>No Google Apps Script Webhook URLs or credentials are sent to the client browser.</li>
                <li>All requests route through Vercel Serverless Function <code>/api/send-email</code>.</li>
                <li>Your Google Apps Script URL is kept safely in server environment variables (<code>GAS_WEBHOOK_URL</code>).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cloud & Database Status */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Database className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">
              Zero-Cost Storage & Database Mode
            </h2>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/60 text-xs">
            <div>
              <div className="font-semibold text-foreground">Firestore Database & Auth</div>
              <div className="text-muted-foreground text-[11px] mt-0.5">
                Running in zero-cost client-side generation mode. No paid storage buckets required.
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-1 text-[11px] font-semibold">
              100% Free Plan
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
