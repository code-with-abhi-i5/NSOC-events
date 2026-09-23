import { useState, useEffect, useRef, useMemo } from "react";
import {
  Code,
  Eye,
  Save,
  Check,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  LayoutTemplate,
} from "lucide-react";
import { templateService } from "@/services/templateService";
import { auditService } from "@/services/auditService";
import type { CertificateTemplate } from "@/types";
import QRCode from "qrcode";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "html" | "css">("preview");
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // Sample data for preview
  const [sampleRecipient, setSampleRecipient] = useState("Abhijeet Ghosh");
  const [sampleTrack, setSampleTrack] = useState("Winner - 1st Place");
  const [sampleDetails, setSampleDetails] = useState(
    "In formal recognition of your exceptional dedication, technical excellence, and outstanding performance in Web Architecture & Full Stack Development."
  );
  const [sampleSignatory, setSampleSignatory] = useState("Dr. Aman Kumar");
  const [sampleSignatoryTitle, setSampleSignatoryTitle] = useState("General Chair, NSOC 2026");
  const [sampleCertId, setSampleCertId] = useState("NSOC26-WIN-001");
  const [sampleIssueDate, setSampleIssueDate] = useState("23 September 2026");
  const [sampleQrCode, setSampleQrCode] = useState<string>("");

  // Zoom & Viewport scale
  const [zoom, setZoom] = useState<number>(0.75);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Generate valid sample QR code
  useEffect(() => {
    QRCode.toDataURL(`https://nsoc-events.vercel.app/verify/${sampleCertId}`, {
      width: 250,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setSampleQrCode)
      .catch(() => {});
  }, [sampleCertId]);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const list = await templateService.getCertificateTemplates();
    setTemplates(list);
    if (list.length > 0) {
      setSelectedTemplate(list[0]);
      setHtmlContent(list[0].htmlContent);
      setCssContent(list[0].cssContent);
    }
  }

  const handleSelectTemplate = (tpl: CertificateTemplate) => {
    setSelectedTemplate(tpl);
    setHtmlContent(tpl.htmlContent);
    setCssContent(tpl.cssContent);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    const updated: CertificateTemplate = {
      ...selectedTemplate,
      htmlContent,
      cssContent,
      updatedAt: new Date(),
    };
    await templateService.saveCertificateTemplate(updated);
    await auditService.log({
      actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
      action: "TEMPLATE_UPDATED",
      target: selectedTemplate.id,
      details: `Updated certificate template layout: ${selectedTemplate.name}`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetDefault = () => {
    if (!confirm("Are you sure you want to reset this template to the official NSOC Executive Gold design?")) return;
    const defaultHtml = `<div class="cert-card">
  <div class="cert-border">
    <div class="cert-header">
      <div class="cert-badge">NSOC 2026 OFFICIAL CREDENTIAL</div>
      <h1 class="cert-title">CERTIFICATE OF RECOGNITION</h1>
      <p class="cert-subtitle">This certificate is proudly awarded to</p>
    </div>
    <div class="cert-body">
      <div class="recipient-name">{{recipient_name}}</div>
      <p class="cert-track">for exemplary merit and distinguished achievement as</p>
      <div class="award-type">{{certificate_type}}</div>
      <p class="cert-desc">{{contribution_details}}</p>
    </div>
    <div class="cert-footer">
      <div class="sig-block">
        <div class="sig-line">{{signatory_name}}</div>
        <div class="sig-title">{{signatory_title}}</div>
      </div>
      <div class="cert-qr-block">
        <img src="{{qr_code_url}}" alt="QR Code" class="cert-qr" />
        <div class="cert-code">ID: {{certificate_id}}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line">{{issue_date}}</div>
        <div class="sig-title">Date of Issue</div>
      </div>
    </div>
  </div>
</div>`;

    const defaultCss = `.cert-card {
  width: 100%;
  aspect-ratio: 16 / 10.5;
  background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #09090b 100%);
  color: #f8fafc;
  padding: 32px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
}
.cert-border {
  flex: 1;
  border: 2px solid rgba(234, 179, 8, 0.4);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 30px rgba(234, 179, 8, 0.1);
  text-align: center;
}
.cert-badge {
  font-size: 11px;
  letter-spacing: 3px;
  color: #fbbf24;
  font-weight: 700;
  margin-bottom: 8px;
}
.cert-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cert-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
.recipient-name {
  font-size: 32px;
  font-weight: 800;
  color: #facc15;
  margin: 14px 0 6px 0;
  letter-spacing: 1px;
}
.cert-track {
  font-size: 12px;
  color: #94a3b8;
  margin: 4px 0;
}
.award-type {
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
  color: #38bdf8;
  border-bottom: 1px solid rgba(56, 189, 248, 0.3);
  padding-bottom: 4px;
  margin-bottom: 8px;
}
.cert-desc {
  font-size: 12px;
  color: #cbd5e1;
  max-width: 600px;
  margin: 0 auto;
}
.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 16px;
}
.sig-block {
  text-align: left;
}
.sig-line {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  border-bottom: 1px solid #475569;
  padding-bottom: 4px;
  min-width: 140px;
}
.sig-title {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}
.cert-qr-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cert-qr {
  width: 58px;
  height: 58px;
  border-radius: 6px;
  background: #ffffff;
  padding: 3px;
}
.cert-code {
  font-family: monospace;
  font-size: 9px;
  color: #fbbf24;
  margin-top: 4px;
}`;

    setHtmlContent(defaultHtml);
    setCssContent(defaultCss);
  };

  // Compile isolated HTML document for the iframe
  const compiledDocument = useMemo(() => {
    let rawHtml = htmlContent || "";
    const qrUrl = sampleQrCode || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='black'/></svg>";

    rawHtml = rawHtml.replace(/{{recipient_name}}/gi, sampleRecipient);
    rawHtml = rawHtml.replace(/{{certificate_type}}/gi, sampleTrack);
    rawHtml = rawHtml.replace(/{{contribution_details}}/gi, sampleDetails);
    rawHtml = rawHtml.replace(/{{signatory_name}}/gi, sampleSignatory);
    rawHtml = rawHtml.replace(/{{signatory_title}}/gi, sampleSignatoryTitle);
    rawHtml = rawHtml.replace(/{{certificate_id}}/gi, sampleCertId);
    rawHtml = rawHtml.replace(/{{issue_date}}/gi, sampleIssueDate);
    rawHtml = rawHtml.replace(/{{qr_code_url}}/gi, qrUrl);

    // If user pasted a full HTML document
    if (rawHtml.toLowerCase().includes("<html") || rawHtml.toLowerCase().includes("<!doctype")) {
      if (cssContent.trim()) {
        if (rawHtml.includes("</head>")) {
          return rawHtml.replace("</head>", `<style>${cssContent}</style></head>`);
        } else {
          return `<style>${cssContent}</style>` + rawHtml;
        }
      }
      return rawHtml;
    }

    // Standard modular template wrapped in full isolated sandbox
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    ${cssContent}
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;
  }, [htmlContent, cssContent, sampleRecipient, sampleTrack, sampleDetails, sampleSignatory, sampleSignatoryTitle, sampleCertId, sampleIssueDate, sampleQrCode]);

  // Auto-fit calculation
  useEffect(() => {
    function computeAutoFit() {
      if (!isAutoFit || !previewContainerRef.current) return;
      const containerWidth = previewContainerRef.current.clientWidth - 48; // padding
      if (containerWidth > 0) {
        // Base width of 1000px
        const calculatedScale = Math.min(1.0, Math.max(0.35, containerWidth / 1000));
        setZoom(Number(calculatedScale.toFixed(2)));
      }
    }

    computeAutoFit();
    window.addEventListener("resize", computeAutoFit);
    return () => window.removeEventListener("resize", computeAutoFit);
  }, [isAutoFit, activeTab]);

  const handleOpenNewWindow = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(compiledDocument);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {savedToast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400 animate-in fade-in">
          <Check className="h-4 w-4" />
          Template changes saved successfully.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Certificate Template Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Visual HTML/CSS engine for rendering high-fidelity certificates with sandboxed live preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
            title="Reset to official Executive Gold layout"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Design
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Templates & Sample Data Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Template Selector Card */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available Templates
            </h3>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left rounded-lg p-3 text-xs transition-colors border ${
                    selectedTemplate?.id === tpl.id
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tpl.name}</span>
                    {tpl.isDefault && (
                      <span className="text-[10px] rounded bg-amber-500/20 text-amber-400 px-1.5 py-0.5 font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  {tpl.description && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Recipient Tester */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Live Preview Parameters
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={sampleRecipient}
                  onChange={(e) => setSampleRecipient(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Certificate Track</label>
                <input
                  type="text"
                  value={sampleTrack}
                  onChange={(e) => setSampleTrack(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Certificate ID</label>
                <input
                  type="text"
                  value={sampleCertId}
                  onChange={(e) => setSampleCertId(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Signatory Name</label>
                <input
                  type="text"
                  value={sampleSignatory}
                  onChange={(e) => setSampleSignatory(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={sampleSignatoryTitle}
                  onChange={(e) => setSampleSignatoryTitle(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Date of Issue</label>
                <input
                  type="text"
                  value={sampleIssueDate}
                  onChange={(e) => setSampleIssueDate(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Contribution / Description</label>
                <textarea
                  rows={2}
                  value={sampleDetails}
                  onChange={(e) => setSampleDetails(e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Interpolation Tokens Reference */}
          <div className="rounded-xl border border-border/60 bg-card p-4 text-xs space-y-2 shadow-sm">
            <span className="font-semibold text-foreground">Dynamic Template Tokens:</span>
            <p className="text-[11px] text-muted-foreground">
              These tokens are automatically replaced with real attendee data during issuance:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "{{recipient_name}}",
                "{{certificate_type}}",
                "{{contribution_details}}",
                "{{signatory_name}}",
                "{{signatory_title}}",
                "{{certificate_id}}",
                "{{issue_date}}",
                "{{qr_code_url}}",
              ].map((token) => (
                <span
                  key={token}
                  className="rounded bg-secondary/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40 select-all"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Studio Editor & Scaled Sandboxed Preview */}
        <div className="lg:col-span-8 rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col shadow-sm">
          {/* Studio Navigation & Zoom Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/30 gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab("html")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "html"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                HTML Template
              </button>
              <button
                onClick={() => setActiveTab("css")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "css"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                CSS Stylesheet
              </button>
            </div>

            {/* Zoom & Viewport Toolbar (Visible in Preview Mode) */}
            {activeTab === "preview" && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => {
                    setIsAutoFit(false);
                    setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))));
                  }}
                  className="p-1.5 rounded-md border border-border/60 bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <span className="font-mono text-[11px] px-1 text-foreground font-semibold min-w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>

                <button
                  onClick={() => {
                    setIsAutoFit(false);
                    setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))));
                  }}
                  className="p-1.5 rounded-md border border-border/60 bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => {
                    setIsAutoFit(true);
                    if (previewContainerRef.current) {
                      const containerWidth = previewContainerRef.current.clientWidth - 48;
                      const calculatedScale = Math.min(1.0, Math.max(0.35, containerWidth / 1000));
                      setZoom(Number(calculatedScale.toFixed(2)));
                    }
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    isAutoFit
                      ? "border-primary/40 bg-primary/20 text-primary"
                      : "border-border/60 bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Fit Screen
                </button>

                <button
                  onClick={handleOpenNewWindow}
                  className="p-1.5 rounded-md border border-border/60 bg-secondary/60 hover:bg-secondary text-foreground transition-colors ml-1"
                  title="Open Certificate in Full Window"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Main Studio Viewport */}
          <div className="flex-1 bg-slate-950/70 p-4 sm:p-6 flex flex-col justify-center min-h-[560px]">
            {activeTab === "preview" && (
              <div
                ref={previewContainerRef}
                className="w-full flex-1 flex items-center justify-center overflow-auto p-2"
              >
                {/* Scaled Responsive Wrapper */}
                <div
                  style={{
                    width: `${1000 * zoom}px`,
                    height: `${700 * zoom}px`,
                    transition: "width 0.15s ease, height 0.15s ease",
                  }}
                  className="relative shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-transparent flex-shrink-0"
                >
                  <iframe
                    title="Certificate Live Sandboxed Preview"
                    srcDoc={compiledDocument}
                    style={{
                      width: "1000px",
                      height: "700px",
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                      border: "none",
                      pointerEvents: "auto",
                      display: "block",
                    }}
                    sandbox="allow-scripts"
                    className="bg-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === "html" && (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="text-[11px] text-muted-foreground">
                  Paste or edit your certificate HTML structure. You can use tokens like <code className="text-emerald-400">{"{{recipient_name}}"}</code> and <code className="text-emerald-400">{"{{qr_code_url}}"}</code>:
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<div>Paste your HTML here...</div>"
                  spellCheck={false}
                  className="w-full flex-1 min-h-[460px] rounded-lg border border-border/60 bg-slate-950 p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                />
              </div>
            )}

            {activeTab === "css" && (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="text-[11px] text-muted-foreground">
                  Add styling rules for your certificate. Styles are sandboxed inside the iframe and will never leak into the dashboard:
                </div>
                <textarea
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  placeholder=".cert-card { ... }"
                  spellCheck={false}
                  className="w-full flex-1 min-h-[460px] rounded-lg border border-border/60 bg-slate-950 p-4 font-mono text-xs text-sky-400 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
