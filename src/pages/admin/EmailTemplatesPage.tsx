import { useState, useEffect } from "react";
import { Save, Eye, Code, Check, Send } from "lucide-react";
import { templateService } from "@/services/templateService";
import { auditService } from "@/services/auditService";
import type { EmailTemplate } from "@/types";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [savedToast, setSavedToast] = useState(false);
  const [testSentToast, setTestSentToast] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const list = await templateService.getEmailTemplates();
    setTemplates(list);
    if (list.length > 0) {
      setSelectedTemplate(list[0]);
      setSubject(list[0].subject);
      setHtmlBody(list[0].htmlBody);
    }
  }

  const handleSelect = (tpl: EmailTemplate) => {
    setSelectedTemplate(tpl);
    setSubject(tpl.subject);
    setHtmlBody(tpl.htmlBody);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    const updated: EmailTemplate = {
      ...selectedTemplate,
      subject,
      htmlBody,
      updatedAt: new Date(),
    };
    await templateService.saveEmailTemplate(updated);
    await auditService.log({
      actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
      action: "EMAIL_TEMPLATE_UPDATED",
      target: selectedTemplate.id,
      details: `Saved email template: ${selectedTemplate.name}`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleSendTest = () => {
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 3500);
  };

  const compilePreview = () => {
    let rendered = htmlBody;
    rendered = rendered.replace(/{{recipient_name}}/g, "Jane Doe");
    rendered = rendered.replace(/{{certificate_id}}/g, "NSOC26-WIN-SAMPLE");
    rendered = rendered.replace(
      /{{verification_url}}/g,
      `${window.location.origin}/verify/NSOC26-WIN-SAMPLE`
    );
    return rendered;
  };

  return (
    <div className="space-y-6">
      {savedToast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400">
          <Check className="h-4 w-4" />
          Email template saved successfully.
        </div>
      )}

      {testSentToast && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 text-sm font-medium text-primary">
          <Send className="h-4 w-4" />
          Test dispatch simulated to admin@nsoc.dev
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Email Delivery Templates
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Design transactional emails sent via Cloud Functions and provider API (Resend / SendGrid).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSendTest}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Send Test Preview
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List Selector */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Transactional Templates
          </h3>
          <div className="space-y-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`w-full text-left rounded-lg p-3 text-xs transition-colors border ${
                  selectedTemplate?.id === tpl.id
                    ? "border-primary bg-primary/10 text-foreground font-semibold"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{tpl.name}</span>
                  {tpl.isDefault && (
                    <span className="text-[10px] rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 font-medium">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 truncate">
                  Subject: {tpl.subject}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border/60 text-xs">
            <span className="font-semibold text-foreground">Template Variables:</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {["{{recipient_name}}", "{{certificate_id}}", "{{verification_url}}"].map((t) => (
                <span
                  key={t}
                  className="rounded bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Editor & Preview */}
        <div className="lg:col-span-3 rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col">
          {/* Subject Bar */}
          <div className="border-b border-border/60 p-4 bg-muted/20">
            <label className="text-xs font-medium text-foreground">Subject Line:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 bg-muted/30">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Rendered Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "code"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                HTML Source
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1 min-h-[460px] bg-background/50 flex flex-col justify-center">
            {activeTab === "preview" ? (
              <div className="w-full flex justify-center overflow-auto">
                <div
                  className="w-full max-w-xl shadow-xl rounded-xl overflow-hidden border border-border/60"
                  dangerouslySetInnerHTML={{ __html: compilePreview() }}
                />
              </div>
            ) : (
              <textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                className="w-full h-full min-h-[440px] rounded-lg border border-border/60 bg-slate-950 p-4 font-mono text-xs text-sky-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
