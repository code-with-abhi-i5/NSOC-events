import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import type { Campaign, CampaignStatus } from "@/types";
import { participantService } from "./participantService";

const STORAGE_KEY = "nsoc_campaigns_v2";

// Clear legacy mock cache if present
if (typeof window !== "undefined" && localStorage.getItem("nsoc_campaigns_cache")) {
  localStorage.removeItem("nsoc_campaigns_cache");
}

function getLocalCampaigns(): Campaign[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data, (key, value) => {
      if (key === "createdAt" || key === "updatedAt" || key === "startedAt" || key === "completedAt") {
        return value ? new Date(value) : undefined;
      }
      return value;
    });
  } catch {
    return [];
  }
}

function saveLocalCampaigns(items: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const campaignService = {
  async getAll(): Promise<Campaign[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "campaigns"));
        return querySnapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            ...d,
            id: docSnap.id,
            startedAt: d.startedAt?.toDate ? d.startedAt.toDate() : d.startedAt ? new Date(d.startedAt) : undefined,
            completedAt: d.completedAt?.toDate ? d.completedAt.toDate() : d.completedAt ? new Date(d.completedAt) : undefined,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
          } as Campaign;
        });
      } catch (err) {
        console.warn("Firestore fetch campaigns failed:", err);
      }
    }
    return getLocalCampaigns();
  },

  async createCampaign(params: {
    name: string;
    emailTemplateId: string;
    participantIds: string[];
  }): Promise<Campaign> {
    const id = "cmp-" + Math.random().toString(36).substring(2, 9);
    const newCampaign: Campaign = {
      id,
      name: params.name,
      emailTemplateId: params.emailTemplateId,
      eventId: "nsoc-2026",
      totalRecipients: params.participantIds.length,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: params.participantIds.length,
      bounced: 0,
      status: "QUEUED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "campaigns", id), newCampaign);
      } catch (err) {
        console.warn("Firestore create campaign failed:", err);
      }
    }

    const current = getLocalCampaigns();
    current.unshift(newCampaign);
    saveLocalCampaigns(current);

    return newCampaign;
  },

  async triggerDispatch(campaignId: string): Promise<void> {
    const campaigns = await this.getAll();
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    // Simulate sending dispatch progression
    campaign.status = "PROCESSING";
    campaign.startedAt = new Date();
    await this.update(campaignId, { status: "PROCESSING", startedAt: campaign.startedAt });

    // Update participants' email statuses to SENT / DELIVERED
    const participants = await participantService.getAll();
    const pendingParticipants = participants.filter((p) => p.certificateId && p.emailStatus !== "DELIVERED");

    for (const p of pendingParticipants.slice(0, campaign.totalRecipients)) {
      await participantService.update(p.id, { emailStatus: "DELIVERED" });
    }

    setTimeout(async () => {
      await this.update(campaignId, {
        status: "COMPLETED",
        sent: campaign.totalRecipients,
        delivered: campaign.totalRecipients,
        pending: 0,
        completedAt: new Date(),
      });
    }, 2000);
  },

  async update(id: string, updates: Partial<Campaign>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "campaigns", id), {
          ...updates,
          updatedAt: new Date(),
        });
      } catch (err) {
        console.warn("Firestore update campaign failed:", err);
      }
    }

    const current = getLocalCampaigns();
    const idx = current.findIndex((c) => c.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updatedAt: new Date() };
      saveLocalCampaigns(current);
    }
  },

  async updateStatus(id: string, status: CampaignStatus): Promise<void> {
    await this.update(id, { status });
  },
};
