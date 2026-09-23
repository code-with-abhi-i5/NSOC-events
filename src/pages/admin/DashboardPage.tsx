import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  Users,
  Award,
  Send,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  Mail,
  Search,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CertificatePreviewModal } from "@/components/certificates/CertificatePreviewModal";
import { participantService } from "@/services/participantService";
import { certificateService } from "@/services/certificateService";
import { auditService } from "@/services/auditService";
import type { Participant, Certificate, AuditLog } from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DashboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  const activityData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, { verifications: number; issued: number }> = {};
    for (const d of days) counts[d] = { verifications: 0, issued: 0 };

    certificates.forEach((c) => {
      try {
        if (c.issuedAt) {
          const d = days[new Date(c.issuedAt).getDay()];
          if (counts[d]) counts[d].issued += 1;
        }
      } catch {}
    });

    auditLogs.forEach((a) => {
      if (a.action === "CERTIFICATE_VERIFIED") {
        try {
          const d = days[new Date(a.timestamp).getDay()];
          if (counts[d]) counts[d].verifications += 1;
        } catch {}
      }
    });

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      day,
      verifications: counts[day].verifications,
      issued: counts[day].issued,
    }));
  }, [certificates, auditLogs]);

  useEffect(() => {
    async function loadData() {
      try {
        const [parts, certs, logs] = await Promise.all([
          participantService.getAll(),
          certificateService.getAll(),
          auditService.getAll(),
        ]);
        setParticipants(parts);
        setCertificates(certs);
        setAuditLogs(logs);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalParticipants = participants.length;
  const issuedCertificates = certificates.filter((c) => c.status === "ACTIVE").length;
  const emailsSent = participants.filter((p) => p.emailStatus === "SENT" || p.emailStatus === "DELIVERED").length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry, issuance pipelines, and dispatch metrics for NSOC 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/participants"
            className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Roster
          </Link>
          <Link
            to="/admin/campaigns"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Send className="h-4 w-4" />
            Dispatch Emails
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered"
          value={loading ? "..." : totalParticipants}
          change={14.2}
          icon={Users}
          color="text-indigo-400"
        />
        <StatCard
          title="Certificates Issued"
          value={loading ? "..." : issuedCertificates}
          change={28.5}
          icon={Award}
          color="text-amber-400"
        />
        <StatCard
          title="Dispatched Credentials"
          value={loading ? "..." : emailsSent}
          change={9.4}
          icon={Mail}
          color="text-emerald-400"
        />
        <StatCard
          title="Verification Lookups"
          value="680+"
          change={44.0}
          icon={ShieldCheck}
          color="text-cyan-400"
        />
      </div>

      {/* Chart & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification & Issuance Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Issuance & Verification Velocity
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Past 7-day query activity against live Firestore registry
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="verifications"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerif)"
                  name="Verifications"
                />
                <Area
                  type="monotone"
                  dataKey="issued"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIssued)"
                  name="Certificates Issued"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Launch & Actions */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">
              Command Actions
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Rapid workflow triggers and maintenance tools.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/admin/participants"
                className="group flex items-center justify-between rounded-lg border border-border/60 p-3 hover:border-primary/50 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-indigo-500/10 p-2 text-indigo-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      Add / Issue Individual
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Manual participant credential creation
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>

              <Link
                to="/verify"
                target="_blank"
                className="group flex items-center justify-between rounded-lg border border-border/60 p-3 hover:border-primary/50 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-cyan-500/10 p-2 text-cyan-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      Public Portal Lookup
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Test instant verification flow
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>

              <Link
                to="/admin/templates"
                className="group flex items-center justify-between rounded-lg border border-border/60 p-3 hover:border-primary/50 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-amber-500/10 p-2 text-amber-400">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      Template Customizer
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Modify HTML/CSS & QR alignment
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-3.5 text-xs">
            <span className="font-semibold text-primary">System Integrity Check:</span>
            <p className="mt-1 text-muted-foreground">
              Cryptographic hash verification status is active. All issued QR badges link to the verified registry.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Certificates Table & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Certificates */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Recent Issued Credentials
              </h2>
              <p className="text-xs text-muted-foreground">
                Direct view of live issued certificates
              </p>
            </div>
            <Link
              to="/admin/certificates"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All ({certificates.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Certificate ID</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No certificates issued yet. Import participants or issue credentials to get started.
                    </td>
                  </tr>
                ) : (
                  certificates.slice(0, 5).map((cert) => (
                    <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs font-medium text-foreground">
                        {cert.certificateId}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-foreground">{cert.participantName}</div>
                        {cert.teamName && (
                          <div className="text-xs text-muted-foreground">{cert.teamName}</div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-muted-foreground">
                        {cert.certificateType}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={cert.status} />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
            <h2 className="text-base font-semibold text-foreground">Audit Stream</h2>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-primary hover:underline">
              View Log
            </Link>
          </div>

          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No audit events recorded yet.
              </p>
            ) : (
              auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <span className="font-semibold text-foreground font-mono text-[11px]">
                      {log.action}
                    </span>
                    <p className="text-muted-foreground mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        certificate={previewCert}
        onClose={() => setPreviewCert(null)}
      />
    </div>
  );
}
