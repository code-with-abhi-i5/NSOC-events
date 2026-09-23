import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  Download,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CertificatePreviewModal } from "@/components/certificates/CertificatePreviewModal";
import { certificateService } from "@/services/certificateService";
import { auditService } from "@/services/auditService";
import type { Certificate } from "@/types";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    setLoading(true);
    try {
      const data = await certificateService.getAll();
      setCertificates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyLink = (cert: Certificate) => {
    navigator.clipboard.writeText(cert.verificationUrl);
    setCopiedId(cert.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Verification URL copied to clipboard");
  };

  const handleRevoke = async (cert: Certificate) => {
    if (!confirm(`Are you sure you want to revoke certificate ${cert.certificateId}?`)) return;
    try {
      await certificateService.updateStatus(cert.id, "REVOKED");
      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "CERTIFICATE_REVOKED",
        target: cert.certificateId,
        details: `Revoked certificate for ${cert.participantName}`,
      });
      await loadCertificates();
      showToast(`Certificate ${cert.certificateId} has been revoked.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReissue = async (cert: Certificate) => {
    if (!confirm(`Reactivate certificate ${cert.certificateId}?`)) return;
    try {
      await certificateService.updateStatus(cert.id, "ACTIVE");
      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "CERTIFICATE_REISSUED",
        target: cert.certificateId,
        details: `Reactivated certificate for ${cert.participantName}`,
      });
      await loadCertificates();
      showToast(`Certificate ${cert.certificateId} has been reactivated.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = "CertificateID,ParticipantName,TeamName,Type,Status,IssuedAt,VerificationUrl\n";
    const rows = filteredCertificates
      .map(
        (c) =>
          `"${c.certificateId}","${c.participantName}","${c.teamName || ""}","${c.certificateType}","${c.status}","${
            c.issuedAt ? new Date(c.issuedAt).toISOString() : ""
          }","${c.verificationUrl}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nsoc_certificates_${Date.now()}.csv`);
    link.click();
    showToast("Exported registry CSV.");
  };

  const filteredCertificates = certificates.filter((c) => {
    const matchSearch =
      c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      (c.teamName && c.teamName.toLowerCase().includes(search.toLowerCase())) ||
      c.certificateType.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalActive = certificates.filter((c) => c.status === "ACTIVE").length;
  const totalRevoked = certificates.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Certificate Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Authoritative ledger of cryptographic credentials, revocation controls, and public URLs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Registry CSV
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-xs text-muted-foreground">Total Generated</div>
          <div className="text-2xl font-bold text-foreground mt-1">{certificates.length}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-xs text-emerald-400">Active & Verifiable</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalActive}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-xs text-rose-400">Revoked / Suspended</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{totalRevoked}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by certificate ID, recipient name, or track..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background/50 pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-5 py-3">Certificate ID</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Award Category</th>
                <th className="px-5 py-3">Issued Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading certificate ledger...
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No certificates found.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-amber-400">
                      {cert.certificateId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{cert.participantName}</div>
                      {cert.teamName && (
                        <div className="text-[11px] text-muted-foreground">{cert.teamName}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {cert.certificateType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {cert.issuedAt
                        ? new Date(cert.issuedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          title="Preview"
                          className="rounded-md border border-border/60 bg-secondary/50 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyLink(cert)}
                          title="Copy Link"
                          className="rounded-md border border-border/60 bg-secondary/50 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {copiedId === cert.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {cert.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleRevoke(cert)}
                            title="Revoke Certificate"
                            className="rounded-md border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReissue(cert)}
                            title="Reactivate Certificate"
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Public Verification"
                          className="rounded-md border border-border/60 bg-secondary/50 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CertificatePreviewModal
        certificate={previewCert}
        onClose={() => setPreviewCert(null)}
      />
    </div>
  );
}
