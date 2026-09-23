import { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Play,
  CheckCircle2,
  RefreshCw,
  X,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { campaignService } from "@/services/campaignService";
import { participantService } from "@/services/participantService";
import { templateService } from "@/services/templateService";
import { auditService } from "@/services/auditService";
import { emailService } from "@/services/emailService";
import type { Campaign, Participant, EmailTemplate } from "@/types";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [targetGroup, setTargetGroup] = useState<"ALL_ISSUED" | "WINNERS" | "PARTICIPANTS">("ALL_ISSUED");
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cmps, parts, tpls] = await Promise.all([
        campaignService.getAll(),
        participantService.getAll(),
        templateService.getEmailTemplates(),
      ]);
      setCampaigns(cmps);
      setParticipants(parts);
      setTemplates(tpls);
      if (tpls.length > 0) setSelectedTemplateId(tpls[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showNotification = (msg: string) => {
    setActiveMessage(msg);
    setTimeout(() => setActiveMessage(null), 3500);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !selectedTemplateId) return;

    // Filter recipients based on group
    let recipientIds: string[] = [];
    if (targetGroup === "ALL_ISSUED") {
      recipientIds = participants.filter((p) => p.certificateId).map((p) => p.id);
    } else if (targetGroup === "WINNERS") {
      recipientIds = participants
        .filter((p) => p.certificateId && p.certificateType.includes("Winner"))
        .map((p) => p.id);
    } else {
      recipientIds = participants.filter((p) => p.certificateId).map((p) => p.id);
    }

    if (recipientIds.length === 0) {
      alert("No participants found with issued certificates in the selected category.");
      return;
    }

    try {
      const created = await campaignService.createCampaign({
        name: campaignName,
        emailTemplateId: selectedTemplateId,
        participantIds: recipientIds,
      });

      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "CAMPAIGN_CREATED",
        target: created.id,
        details: `Created email campaign "${campaignName}" with ${recipientIds.length} recipients`,
      });

      setIsModalOpen(false);
      setCampaignName("");
      await loadData();
      showNotification(`Campaign "${created.name}" queued with ${recipientIds.length} recipients!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchCampaign = async (cmp: Campaign) => {
    try {
      const candidates = participants.filter((p) => p.certificateId);
      const payloads = candidates.map((p) => ({
        recipientName: p.name,
        recipientEmail: p.email,
        teamName: p.teamName,
        certificateId: p.certificateId!,
        certificateType: p.certificateType,
        verificationUrl: `${window.location.origin}/verify/${p.certificateId}`,
      }));
      if (payloads.length > 0) {
        await emailService.sendBatch(payloads.slice(0, cmp.totalRecipients));
      }
      await campaignService.triggerDispatch(cmp.id);
      await auditService.log({
        actor: { userId: "admin", email: "admin@nsoc.dev", displayName: "Admin" },
        action: "CAMPAIGN_DISPATCHED",
        target: cmp.id,
        details: `Dispatched campaign "${cmp.name}" via Google Apps Script (Gmail)`,
      });
      await loadData();
      showNotification(`Campaign "${cmp.name}" dispatched via Google Apps Script!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {activeMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          {activeMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bulk Email Campaigns
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Dispatch official digital certificate notifications to attendees with transactional delivery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-xs text-muted-foreground">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-xs text-muted-foreground">
            No broadcast campaigns created yet.
          </div>
        ) : (
          campaigns.map((cmp) => {
            const percent =
              cmp.totalRecipients > 0
                ? Math.round((cmp.sent / cmp.totalRecipients) * 100)
                : 0;

            return (
              <div
                key={cmp.id}
                className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4 hover:border-border transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {cmp.name}
                      </h3>
                      <StatusBadge status={cmp.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      ID: {cmp.id} • Target Event: {cmp.eventId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmp.status === "QUEUED" && (
                      <button
                        onClick={() => handleLaunchCampaign(cmp)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Start Dispatch
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Delivery Progress</span>
                    <span className="font-semibold text-foreground font-mono">
                      {cmp.sent} / {cmp.totalRecipients} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Recipients</span>
                    <div className="font-semibold text-foreground mt-0.5">{cmp.totalRecipients}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivered</span>
                    <div className="font-semibold text-emerald-400 mt-0.5">{cmp.delivered}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending</span>
                    <div className="font-semibold text-amber-400 mt-0.5">{cmp.pending}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed / Bounced</span>
                    <div className="font-semibold text-rose-400 mt-0.5">{cmp.failed + cmp.bounced}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Launch Certificate Campaign
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-foreground">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NSOC 2026 Participation Certificates Batch 1"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Email Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Recipient Segment</label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL_ISSUED">All with Issued Certificates</option>
                  <option value="WINNERS">Winners & Runners-up Only</option>
                  <option value="PARTICIPANTS">General Participants</option>
                </select>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Estimated Target:
                </div>
                <div className="mt-1">
                  Emails are processed in throttled queues using serverless worker functions to guarantee high deliverability and avoid spam blacklisting.
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Queue Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
