import { useParams, Link } from "react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  FileText,
  Copy,
  ArrowLeft,
  QrCode,
  Printer,
  Check,
  Lock,
  MessageCircle,
} from "lucide-react";
import { eventConfig } from "@/config/eventConfig";
import { formatDate } from "@/lib/utils";
import { certificateService } from "@/services/certificateService";
import { templateService } from "@/services/templateService";
import type { Certificate, VerificationResult, CertificateTemplate } from "@/types";

export default function VerifyResultPage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"certificate" | "ledger">("certificate");
  const certContainerRef = useRef<HTMLDivElement>(null);
  const [certScale, setCertScale] = useState(0.85);

  useEffect(() => {
    async function performLookup() {
      setIsLoading(true);
      const id = certificateId?.trim().toUpperCase() || "";
      const [verification, templates] = await Promise.all([
        certificateService.verify(id),
        templateService.getCertificateTemplates(),
      ]);

      setResult(verification.result);
      setCertificate(verification.certificate || null);
      if (templates.length > 0) {
        setTemplate(templates[0]);
      }
      setIsLoading(false);
    }
    performLookup();
  }, [certificateId]);

  // Responsive scale for certificate iframe
  useEffect(() => {
    function computeScale() {
      if (!certContainerRef.current) return;
      const width = certContainerRef.current.clientWidth - 32;
      if (width > 0) {
        const scale = Math.min(1.0, Math.max(0.35, width / 1000));
        setCertScale(Number(scale.toFixed(2)));
      }
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [isLoading, certificate]);

  const handleCopy = async () => {
    if (certificate?.verificationUrl) {
      await navigator.clipboard.writeText(certificate.verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Social Share Handlers
  const handleShareLinkedIn = () => {
    if (!certificate) return;
    const certName = encodeURIComponent(`${certificate.certificateType} — ${certificate.eventName}`);
    const orgName = encodeURIComponent(eventConfig.name);
    const certUrl = encodeURIComponent(certificate.verificationUrl);
    const certId = encodeURIComponent(certificate.certificateId);
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=2026&issueMonth=3&certUrl=${certUrl}&certId=${certId}`;
    window.open(url, "_blank");
  };

  const handleShareTwitter = () => {
    if (!certificate) return;
    const text = encodeURIComponent(
      `Proud to receive my official certificate for ${certificate.certificateType} at ${certificate.eventName}! 🎓 Verified on the public ledger: ${certificate.verificationUrl} #NSOC2026 #OpenSource`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!certificate) return;
    const text = encodeURIComponent(
      `Check out my official verified certificate from ${certificate.eventName}! 🎉\n\nRecipient: ${certificate.participantName}\nAward: ${certificate.certificateType}\nVerify online: ${certificate.verificationUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Compile certificate HTML document
  const compiledCertDoc = useMemo(() => {
    if (!certificate) return "";

    const rawHtml = template?.htmlContent || "";
    const rawCss = template?.cssContent || "";

    const qrUrl =
      certificate.qrCodeDataUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
        certificate.verificationUrl
      )}&bgcolor=ffffff&color=0c1a3a`;

    let subType = certificate.certificateType ? certificate.certificateType.toUpperCase() : "OF PARTICIPATION";
    if (!subType.startsWith("OF ")) {
      subType = "OF " + subType;
    }

    const teamHtml = certificate.teamName
      ? `<div class="team" style="font-size: 13px; font-weight: 700; color: #2563eb; margin-top: 4px;">Team: ${certificate.teamName}</div>`
      : "";

    let html = rawHtml;

    // Dynamically replace recipient name (including any template dummy name like Mayank Gupta)
    html = html.replace(/{{recipient_name}}/gi, certificate.participantName);
    html = html.replace(/Mayank Gupta/g, certificate.participantName);

    // Dynamically replace Certificate ID
    html = html.replace(/{{certificate_id}}/gi, certificate.certificateId);
    html = html.replace(/NSOC26-PAR-00108/g, certificate.certificateId);

    // Dynamically replace QR code and verification target
    html = html.replace(/{{qr_code_url}}/gi, qrUrl);
    html = html.replace(/CODEATHON-2\.0-CERT/g, encodeURIComponent(certificate.verificationUrl));

    // Dynamically replace certificate type & category
    html = html.replace(/{{certificate_type_sub}}/gi, subType);
    html = html.replace(/{{certificate_type}}/gi, certificate.certificateType || "Certificate of Participation");
    html = html.replace(/OF PARTICIPATION/g, subType);

    // Team name
    html = html.replace(/{{team_block}}/gi, teamHtml);
    html = html.replace(/{{team_name}}/gi, certificate.teamName || "");

    // Signatories & event details
    html = html.replace(/{{signatory_name}}/gi, certificate.organizerName || "Aman Singh");
    html = html.replace(/{{signatory_title}}/gi, certificate.signature || "Founder, Nexus Spring of Code");
    html = html.replace(
      /{{contribution_details}}/gi,
      certificate.contributionDetails || "for actively participating in CODE-A-THON 2.0 – 24-Hour Hackathon"
    );
    html = html.replace(
      /{{issue_date}}/gi,
      certificate.issuedAt ? formatDate(certificate.issuedAt) : "25–26 September 2026"
    );

    if (html.toLowerCase().includes("<html") || html.toLowerCase().includes("<!doctype")) {
      return html;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
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
      font-family: 'Inter', system-ui, sans-serif;
    }
    ${rawCss}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }, [certificate, template]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Authenticating credential against NSOC ledger...
          </p>
          <p className="text-xs text-muted-foreground">Checking cryptographic signature & validity</p>
        </motion.div>
      </div>
    );
  }

  // Not Found State
  if (result === "NOT_FOUND" || !certificate) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-grid px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl border border-destructive/30 backdrop-blur-xl">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4 text-destructive">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Credential Not Found
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 mb-4">
              No active certificate matches the entered identifier:
            </p>
            <div className="inline-block px-4 py-2 rounded-xl bg-muted/60 border border-border/80 font-mono text-sm text-foreground font-semibold mb-6">
              {certificateId?.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Please double check the ID from your email or certificate stamp. IDs are case-insensitive and follow format: <code className="text-primary font-mono">NSOC26-XXX-XXX</code>.
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Try Another Identifier
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Revoked State
  if (result === "REVOKED") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-grid px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl border border-rose-500/40 backdrop-blur-xl">
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Certificate Revoked
            </h1>
            <p className="text-xs sm:text-sm text-rose-400 mt-2 mb-6">
              This credential was officially revoked by the issuing authority and is no longer valid.
            </p>
            <div className="rounded-xl bg-muted/50 p-4 text-left text-xs space-y-2 mb-6 border border-border/60">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate ID:</span>
                <span className="font-mono font-bold text-foreground">{certificate.certificateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Recipient:</span>
                <span className="font-semibold text-foreground">{certificate.participantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-rose-400">REVOKED / VOID</span>
              </div>
            </div>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Verification
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- SUCCESSFUL AUTHENTICATION ----
  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 h-[450px] w-[450px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8 relative z-10">
        {/* Verification Success Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-emerald-950/80 p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  OFFICIALLY AUTHENTICATED
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <Lock className="h-2.5 w-2.5" /> Immutable
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Valid Credential Verified
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Issued by {certificate.eventName} on {certificate.issuedAt ? formatDate(certificate.issuedAt) : "2026"}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-[1.02]"
              title="Print or Save as PDF"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-secondary/80 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
              title="Copy Verification Link"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* View Switcher Tabs & Social Sharing Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("certificate")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "certificate"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="inline h-3.5 w-3.5 mr-1.5" />
              Visual Certificate
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ledger"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="inline h-3.5 w-3.5 mr-1.5" />
              Verification Details & Ledger
            </button>
          </div>

          {/* Social Share Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground text-[11px] font-medium mr-1">Share Credential:</span>
            <button
              onClick={handleShareLinkedIn}
              className="p-2 rounded-lg bg-[#0077b5]/15 hover:bg-[#0077b5]/30 text-[#0077b5] border border-[#0077b5]/30 transition-colors"
              title="Add to LinkedIn Profile"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 transition-colors"
              title="Share on X (Twitter)"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="Share on WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Full-Fidelity Visual Certificate Showcase */}
        {activeTab === "certificate" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Certificate Display Frame */}
            <div
              ref={certContainerRef}
              className="w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden rounded-3xl bg-slate-950/70 border border-border/80 shadow-2xl relative"
            >
              <div
                style={{
                  width: `${1000 * certScale}px`,
                  height: `${708 * certScale}px`,
                  transition: "width 0.15s ease, height 0.15s ease",
                }}
                className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border border-blue-500/30 flex-shrink-0"
              >
                <iframe
                  title="Official Verified Certificate"
                  srcDoc={compiledCertDoc}
                  style={{
                    width: "1000px",
                    height: "708px",
                    transform: `scale(${certScale})`,
                    transformOrigin: "top left",
                    border: "none",
                  }}
                  className="bg-transparent"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center flex items-center justify-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              Scan the QR code on the certificate with any phone to immediately open this live record.
            </p>
          </motion.div>
        )}

        {/* Tab 2: Cryptographic Ledger & Metadata */}
        {activeTab === "ledger" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left 2 Cols: Detailed Roster Record */}
            <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-border/60 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Attendee Roster Record
                </span>
                <h2 className="text-2xl font-black text-foreground mt-1">
                  {certificate.participantName}
                </h2>
                {certificate.teamName && (
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    Team: {certificate.teamName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                  <div className="text-muted-foreground font-medium">Certificate Identifier</div>
                  <div className="font-mono text-sm font-bold text-amber-400 mt-1">
                    {certificate.certificateId}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                  <div className="text-muted-foreground font-medium">Award Category</div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {certificate.certificateType}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                  <div className="text-muted-foreground font-medium">Event Name</div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {certificate.eventName} {certificate.eventYear}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                  <div className="text-muted-foreground font-medium">Issuing Authority</div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {certificate.signature || "Dr. Aman Kumar, General Chair"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 p-4 border border-border/40 text-xs">
                <div className="text-muted-foreground font-medium">Performance Citation</div>
                <p className="text-foreground/90 mt-1 leading-relaxed">
                  {certificate.contributionDetails || "Recognized for distinguished merit, technical excellence, and dedication to open-source software collaboration."}
                </p>
              </div>

              {/* Immutable Verification URL Box */}
              <div className="rounded-xl bg-muted/50 p-4 border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Permanent Verification URL</span>
                  <button
                    onClick={handleCopy}
                    className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <code className="block rounded-lg bg-background p-2.5 font-mono text-[11px] text-foreground truncate border border-border/60">
                  {certificate.verificationUrl}
                </code>
              </div>
            </div>

            {/* Right Col: QR Anchor & Cryptographic Seal */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm space-y-6">
              <div className="text-center space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Authoritative QR Badge
                </span>
                
                <div className="p-4 bg-white rounded-2xl inline-block shadow-md border border-amber-500/40">
                  <img
                    src={certificate.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(certificate.verificationUrl)}`}
                    alt="Certificate QR Badge"
                    className="h-36 w-36 mx-auto block"
                  />
                </div>

                <div className="font-mono text-xs font-bold text-amber-400">
                  {certificate.certificateId}
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  Tamper-Evident Ledger
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This record is permanently hosted on the NSOC open-source platform. Any alteration invalidates digital verification.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Link */}
        <div className="pt-6 text-center">
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Verify Another Certificate
          </Link>
        </div>
      </div>
    </div>
  );
}
