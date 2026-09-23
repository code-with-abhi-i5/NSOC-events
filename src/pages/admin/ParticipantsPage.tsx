import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Trash2,
  Award,
  Download,
  Check,
  X,
  Mail,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { participantService } from "@/services/participantService";
import { certificateService } from "@/services/certificateService";
import { auditService } from "@/services/auditService";
import { emailService } from "@/services/emailService";
import type { Participant } from "@/types";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Participant Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [newType, setNewType] = useState("Participation");
  const [newRank, setNewRank] = useState<number | undefined>(undefined);

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [importPreview, setImportPreview] = useState<
    Array<{ name: string; email: string; teamName?: string; certificateType: string; rank?: number }>
  >([]);

  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {
    setLoading(true);
    try {
      const data = await participantService.getAll();
      setParticipants(data);
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setLoading(false);
    }
  }

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredParticipants.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail) {
      showNotification("Please provide both name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await participantService.add({
        name: trimmedName,
        email: trimmedEmail,
        teamName: newTeam.trim() || undefined,
        certificateType: newType,
        rank: newRank,
        eventId: "nsoc-2026",
        eventYear: 2026,
        status: "PENDING",
        emailStatus: "PENDING",
      });

      try {
        await auditService.log({
          actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
          action: "PARTICIPANT_ADDED",
          details: `Manually added ${trimmedName} (${trimmedEmail})`,
        });
      } catch (auditErr) {
        console.warn("Audit log notice:", auditErr);
      }

      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewTeam("");
      setNewType("Participation");
      setNewRank(undefined);
      await loadParticipants();
      showNotification(`Participant ${trimmedName} registered successfully!`);
    } catch (err: any) {
      console.error("Failed to add participant:", err);
      showNotification(
        "Error adding participant: " + (err?.message || "Please check console details.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueSingle = async (p: Participant) => {
    try {
      const cert = await certificateService.issueCertificate({
        participantId: p.id,
        participantName: p.name,
        teamName: p.teamName,
        certificateType: p.certificateType,
        rank: p.rank,
      });

      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "CERTIFICATE_ISSUED",
        target: cert.certificateId,
        details: `Issued ${p.certificateType} certificate for ${p.name}`,
      });

      await loadParticipants();
      showNotification(`Certificate ${cert.certificateId} generated for ${p.name}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmail = async (p: Participant) => {
    if (!p.certificateId) return;
    try {
      await emailService.sendViaAppsScript({
        recipientName: p.name,
        recipientEmail: p.email,
        teamName: p.teamName,
        certificateId: p.certificateId,
        certificateType: p.certificateType,
        verificationUrl: `${window.location.origin}/verify/${p.certificateId}`,
      });
      await participantService.update(p.id, { emailStatus: "DELIVERED", status: "EMAIL_SENT" });
      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "EMAIL_SENT_APPS_SCRIPT",
        target: p.certificateId,
        details: `Dispatched certificate email via Google Apps Script to ${p.email}`,
      });
      await loadParticipants();
      showNotification(`Email dispatched to ${p.email} via Google Apps Script (Gmail)!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkIssue = async () => {
    if (selectedIds.length === 0) return;
    const candidates = participants.filter((p) => selectedIds.includes(p.id));
    try {
      await certificateService.bulkIssue(candidates);
      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "BULK_CERTIFICATES_ISSUED",
        details: `Batch issued ${candidates.length} certificates`,
      });
      setSelectedIds([]);
      await loadParticipants();
      showNotification(`Successfully issued ${candidates.length} certificates!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkEmail = async () => {
    const candidates = participants.filter((p) => selectedIds.includes(p.id) && p.certificateId);
    if (candidates.length === 0) {
      alert("Selected participants do not have issued certificates yet. Please issue certificates first.");
      return;
    }
    const payloads = candidates.map((p) => ({
      recipientName: p.name,
      recipientEmail: p.email,
      teamName: p.teamName,
      certificateId: p.certificateId!,
      certificateType: p.certificateType,
      verificationUrl: `${window.location.origin}/verify/${p.certificateId}`,
    }));
    await emailService.sendBatch(payloads);
    for (const p of candidates) {
      await participantService.update(p.id, { emailStatus: "DELIVERED", status: "EMAIL_SENT" });
    }
    await auditService.log({
      actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
      action: "BULK_EMAIL_APPS_SCRIPT",
      details: `Batch sent ${candidates.length} emails via Google Apps Script (Gmail)`,
    });
    setSelectedIds([]);
    await loadParticipants();
    showNotification(`Dispatched ${candidates.length} emails via Google Apps Script (Gmail)!`);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} participant(s)?`)) return;
    for (const id of selectedIds) {
      await participantService.delete(id);
    }
    setSelectedIds([]);
    await loadParticipants();
    showNotification("Selected participants removed.");
  };

  // CSV Parsing
  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    const lines = text.trim().split("\n");
    if (lines.length <= 1) {
      setImportPreview([]);
      return;
    }

    const parsed: Array<{ name: string; email: string; teamName?: string; certificateType: string; rank?: number }> = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      if (parts[0] && parts[1]) {
        parsed.push({
          name: parts[0],
          email: parts[1],
          teamName: parts[2] || undefined,
          certificateType: parts[3] || "Participation",
          rank: parts[4] ? parseInt(parts[4], 10) : undefined,
        });
      }
    }
    setImportPreview(parsed);
  };

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    const toImport = importPreview.map((item) => ({
      ...item,
      eventId: "nsoc-2026",
      eventYear: 2026,
      status: "PENDING" as const,
      emailStatus: "PENDING" as const,
    }));

    await participantService.bulkAdd(toImport);
    await auditService.log({
      actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
      action: "CSV_ROSTER_IMPORTED",
      details: `Imported ${toImport.length} participants via CSV parser`,
    });

    setIsImportModalOpen(false);
    setCsvText("");
    setImportPreview([]);
    await loadParticipants();
    showNotification(`Imported ${toImport.length} participants into registry.`);
  };

  const sampleCsv = `Name,Email,TeamName,CertificateType,Rank
Jane Doe,jane.doe@example.com,Vanguard,Winner - 1st Place,1
John Smith,john.smith@example.com,Vanguard,Winner - 1st Place,1
Alex Rivera,alex.r@example.com,Sentinels,Participation,`;

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.teamName && p.teamName.toLowerCase().includes(search.toLowerCase())) ||
      (p.certificateId && p.certificateId.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {actionMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400 animate-in fade-in">
          <Check className="h-4 w-4" />
          {actionMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Participants & Roster
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage attendees, hackathon teams, and individual credential states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV / XLSX Import
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Participant
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, team, or certificate ID..."
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
            <option value="PENDING">Pending</option>
            <option value="CERTIFICATE_GENERATED">Certificate Generated</option>
            <option value="EMAIL_SENT">Email Sent</option>
            <option value="VERIFIED">Verified</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/30 px-5 py-3 text-xs">
          <div className="font-semibold text-primary">
            {selectedIds.length} participant(s) selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkIssue}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Award className="h-3.5 w-3.5" />
              Issue Certificates
            </button>
            <button
              onClick={handleBulkEmail}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Email via Apps Script
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredParticipants.length > 0 &&
                      selectedIds.length === filteredParticipants.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-5 py-3">Participant</th>
                <th className="px-5 py-3">Team</th>
                <th className="px-5 py-3">Certificate Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Certificate ID</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Loading participant records...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No participants found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      selectedIds.includes(p.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => handleSelectOne(p.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.email}</div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground font-medium">
                      {p.teamName || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block rounded-md bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
                        {p.certificateType}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 font-mono font-medium text-foreground">
                      {p.certificateId ? (
                        <span className="text-amber-400">{p.certificateId}</span>
                      ) : (
                        <span className="text-muted-foreground">Not Issued</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!p.certificateId ? (
                        <button
                          onClick={() => handleIssueSingle(p)}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/30 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Award className="h-3 w-3" />
                          Issue
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendEmail(p)}
                            className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                            title="Send Certificate via Google Apps Script (Gmail)"
                          >
                            <Mail className="h-3 w-3" />
                            {p.emailStatus === "DELIVERED" ? "Resend" : "Email"}
                          </button>
                          <span className="text-emerald-400 font-medium text-[11px] inline-flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Ready
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Participant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="text-base font-semibold text-foreground">
                Add Participant
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Patel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="diya@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Team Name (Optional)</label>
                <input
                  type="text"
                  placeholder="CyberTitans"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Certificate Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Participation">Participation</option>
                  <option value="Winner - 1st Place">Winner - 1st Place</option>
                  <option value="Runner Up - 2nd Place">Runner Up - 2nd Place</option>
                  <option value="3rd Place">3rd Place</option>
                  <option value="Speaker & Mentor">Speaker & Mentor</option>
                  <option value="Organizer">Organizer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-border/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Import CSV Roster
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Paste raw CSV records or load sample columns:
                </span>
                <button
                  onClick={() => handleCsvTextChange(sampleCsv)}
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Load Sample Roster
                </button>
              </div>

              <textarea
                rows={5}
                placeholder="Name,Email,TeamName,CertificateType,Rank&#10;Alice Smith,alice@example.com,Team Rocket,Winner - 1st Place,1"
                value={csvText}
                onChange={(e) => handleCsvTextChange(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background font-mono text-xs text-foreground p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {/* Import Preview */}
              {importPreview.length > 0 && (
                <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
                  <div className="text-xs font-semibold text-foreground mb-2">
                    Parsed {importPreview.length} record(s) ready for ingestion:
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {importPreview.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[11px] py-1 border-b border-border/30 last:border-0"
                      >
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{item.email}</span>
                        <span className="text-primary font-medium">{item.certificateType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="rounded-lg border border-border/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleConfirmImport}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Import {importPreview.length} Participants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
