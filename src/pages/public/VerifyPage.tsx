import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  Shield,
  CheckCircle2,
  ClipboardPaste,
  Lock,
  QrCode,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { eventConfig } from "@/config/eventConfig";

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pasteError, setPasteError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certificateId.trim().toUpperCase();
    if (!trimmed) return;
    setIsLoading(true);
    navigate(`/verify/${encodeURIComponent(trimmed)}`);
  };

  const handlePaste = async () => {
    setPasteError("");
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCertificateId(text.trim().toUpperCase());
      }
    } catch {
      setPasteError("Please allow clipboard access to paste.");
      setTimeout(() => setPasteError(""), 3000);
    }
  };

  const handleSampleClick = (sampleId: string) => {
    setCertificateId(sampleId);
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center bg-grid px-4 py-16 relative overflow-hidden">
      {/* Radiant ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[380px] w-[380px] rounded-full bg-indigo-500/15 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[90px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        {/* Main Verification Card */}
        <div className="rounded-3xl p-8 sm:p-12 shadow-2xl border border-border/80 bg-card/85 backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 text-primary shadow-inner mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary mb-2">
              Cryptographic Ledger Terminal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Certificate Authentication
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Enter the unique credential identifier from your certificate or email to confirm official authenticity.
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="certificate-id"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Credential Identifier
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <ClipboardPaste className="h-3 w-3" />
                  Paste from Clipboard
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="certificate-id"
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                  placeholder="e.g. NSOC26-WIN-001"
                  className="w-full rounded-2xl border border-input bg-background/70 py-4 pl-11 pr-4 font-mono text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner tracking-wider"
                  autoComplete="off"
                  spellCheck="false"
                  autoFocus
                />
              </div>

              {pasteError && (
                <p className="mt-1.5 text-xs text-rose-400">{pasteError}</p>
              )}

              {/* Sample Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-medium">Test sample formats:</span>
                {[
                  { id: "NSOC26-WIN-001", label: "Winner" },
                  { id: "NSOC26-RUN-002", label: "Runner-Up" },
                  { id: "NSOC26-PAR-042", label: "Participant" },
                ].map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSampleClick(sample.id)}
                    className="font-mono rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-foreground hover:bg-primary/15 hover:border-primary/40 transition-colors flex items-center gap-1"
                  >
                    <span>{sample.id}</span>
                    <span className="text-[10px] text-muted-foreground">({sample.label})</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!certificateId.trim() || isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating Ledger Record...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Authenticate Credential
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security Features Strip */}
          <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <Lock className="h-4 w-4 text-emerald-400 mx-auto" />
              <div className="text-[11px] font-semibold text-foreground">SHA-256 Hash</div>
              <div className="text-[10px] text-muted-foreground">Tamper-Evident</div>
            </div>
            <div className="space-y-1">
              <QrCode className="h-4 w-4 text-primary mx-auto" />
              <div className="text-[11px] font-semibold text-foreground">Instant QR</div>
              <div className="text-[10px] text-muted-foreground">Mobile Friendly</div>
            </div>
            <div className="space-y-1">
              <Shield className="h-4 w-4 text-amber-400 mx-auto" />
              <div className="text-[11px] font-semibold text-foreground">Official Ledger</div>
              <div className="text-[10px] text-muted-foreground">Permanent Record</div>
            </div>
          </div>
        </div>

        {/* Verification Terminal Helper */}
        <div className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground backdrop-blur-sm flex items-start gap-3">
          <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-foreground">Where do I find my Certificate ID?</div>
            <div>
              Your Certificate ID is printed on the bottom-right corner of your official PDF certificate and was also sent in your congratulatory email.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <span className="font-semibold text-foreground">
            {eventConfig.name} Authoritative Verification Engine
          </span>
        </p>
      </motion.div>
    </div>
  );
}
