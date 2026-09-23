import React, { useRef } from "react";
import { X, Printer, ShieldCheck, Copy, Check } from "lucide-react";
import type { Certificate } from "@/types";
import { useState } from "react";

interface CertificatePreviewModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!certificate) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Certificate Preview
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {certificate.certificateId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="overflow-y-auto p-6 flex justify-center bg-muted/30">
          <div
            ref={certRef}
            className="w-full max-w-3xl rounded-xl border-2 border-amber-500/40 bg-gradient-to-b from-[#111322] via-[#090b14] to-[#04060c] p-8 sm:p-12 text-center text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden"
          >
            {/* Corner Ornamental Accents */}
            <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-amber-400/80" />
            <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-amber-400/80" />
            <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-amber-400/80" />
            <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-amber-400/80" />

            <div className="mb-2 text-xs font-bold uppercase tracking-[4px] text-amber-400">
              National Students Open-Source Conference 2026
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200">
              CERTIFICATE OF RECOGNITION
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              This credential is valid and officially registered under cryptographic record
            </p>

            <div className="my-8">
              <span className="text-xs uppercase tracking-widest text-slate-400">
                Presented to
              </span>
              <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-wide font-serif">
                {certificate.participantName}
              </div>
              {certificate.teamName && (
                <div className="mt-1 text-sm text-cyan-300 font-medium">
                  Team: {certificate.teamName}
                </div>
              )}
            </div>

            <div className="my-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-1.5 text-sm font-semibold text-cyan-300">
              {certificate.certificateType}
            </div>

            <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed my-4">
              {certificate.contributionDetails}
            </p>

            {/* Footer with Signatures & QR */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-800/80 pt-6">
              <div className="text-center sm:text-left">
                <div className="text-sm font-semibold text-slate-200 font-serif border-b border-slate-700 pb-1">
                  {certificate.signature || "Dr. Aman Kumar, General Chair"}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Authorized Signatory</div>
              </div>

              <div className="flex flex-col items-center">
                {certificate.qrCodeDataUrl ? (
                  <img
                    src={certificate.qrCodeDataUrl}
                    alt="QR Code"
                    className="h-16 w-16 rounded-md bg-white p-1"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-white/10 flex items-center justify-center text-[10px] text-slate-400">
                    QR Code
                  </div>
                )}
                <span className="mt-1 font-mono text-[10px] text-amber-400">
                  {certificate.certificateId}
                </span>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-sm font-semibold text-slate-200 border-b border-slate-700 pb-1">
                  {certificate.issuedAt
                    ? new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "March 2026"}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Date of Issuance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
