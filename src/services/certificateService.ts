import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Certificate, CertificateStatus, VerificationResult } from "@/types";
import { participantService } from "./participantService";
import QRCode from "qrcode";

const STORAGE_KEY = "nsoc_certificates_v2";

function stripUndefined<T extends Record<string, any>>(obj: T): any {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

function getLocalCertificates(): Certificate[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data, (key, value) => {
      if (key === "issuedAt" || key === "createdAt" || key === "updatedAt" || key === "revokedAt") {
        return value ? new Date(value) : undefined;
      }
      return value;
    });
  } catch {
    return [];
  }
}

function saveLocalCertificates(items: Certificate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function generateCertificateId(type: string, year = 2026): string {
  const shortType = type.includes("Winner")
    ? "WIN"
    : type.includes("Runner")
    ? "RUN"
    : type.includes("Speaker")
    ? "SPK"
    : type.includes("Organizer")
    ? "ORG"
    : "PAR";
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NSOC${year.toString().slice(-2)}-${shortType}-${randomHex}`;
}

export const certificateService = {
  async getAll(): Promise<Certificate[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "certificates"));
        const firestoreList = querySnapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            ...d,
            id: docSnap.id,
            issuedAt: d.issuedAt?.toDate ? d.issuedAt.toDate() : d.issuedAt ? new Date(d.issuedAt) : undefined,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
          } as Certificate;
        });
        firestoreList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Directly sync local storage with Firestore source of truth
        saveLocalCertificates(firestoreList);
        return firestoreList;
      } catch (err) {
        console.warn("Firestore fetch certificates failed, falling back to local:", err);
      }
    }
    return getLocalCertificates();
  },

  async getById(certificateId: string): Promise<Certificate | null> {
    const list = await this.getAll();
    const normalized = certificateId.trim().toUpperCase();
    return (
      list.find(
        (c) =>
          c.certificateId.toUpperCase() === normalized ||
          c.id.toUpperCase() === normalized
      ) || null
    );
  },

  async verify(certificateId: string): Promise<{
    result: VerificationResult;
    certificate?: Certificate;
  }> {
    const cert = await this.getById(certificateId);

    if (!cert) {
      return {
        result: "NOT_FOUND",
      };
    }

    if (cert.status === "REVOKED") {
      return {
        result: "REVOKED",
        certificate: cert,
      };
    }

    return {
      result: "VALID",
      certificate: cert,
    };
  },

  async issueCertificate(params: {
    participantId: string;
    participantName: string;
    teamName?: string;
    certificateType: string;
    rank?: number;
    contributionDetails?: string;
  }): Promise<Certificate> {
    const certId = generateCertificateId(params.certificateType);
    const verificationUrl = `${window.location.origin}/verify/${certId}`;

    let qrCodeDataUrl = "";
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 250,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });
    } catch (e) {
      console.error("QR Code generation error:", e);
    }

    const newCert: Certificate = {
      id: "cert-" + Math.random().toString(36).substring(2, 9),
      certificateId: certId,
      participantId: params.participantId,
      participantName: params.participantName,
      teamName: params.teamName,
      eventId: "nsoc-2026",
      eventName: "National Students Open-Source Conference 2026",
      eventYear: 2026,
      certificateType: params.certificateType,
      templateId: "tpl-default-01",
      status: "ACTIVE",
      issuedAt: new Date(),
      verificationUrl,
      qrCodeDataUrl,
      rank: params.rank,
      contributionDetails: params.contributionDetails || "Distinguished participation at NSOC 2026",
      organizerName: "Aman Kumar",
      signature: "Dr. Aman Kumar, General Chair",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const current = getLocalCertificates();
    current.unshift(newCert);
    saveLocalCertificates(current);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "certificates", newCert.id), stripUndefined(newCert));
      } catch (err) {
        console.error("Firestore save certificate failed:", err);
      }
    }

    // Update participant record status
    await participantService.update(params.participantId, {
      certificateId: certId,
      status: "CERTIFICATE_GENERATED",
    });

    return newCert;
  },

  async bulkIssue(
    participants: {
      id: string;
      name: string;
      teamName?: string;
      certificateType: string;
      rank?: number;
    }[]
  ): Promise<Certificate[]> {
    const certs: Certificate[] = [];
    for (const p of participants) {
      const cert = await this.issueCertificate({
        participantId: p.id,
        participantName: p.name,
        teamName: p.teamName,
        certificateType: p.certificateType,
        rank: p.rank,
      });
      certs.push(cert);
    }
    return certs;
  },

  async updateStatus(
    id: string,
    status: CertificateStatus,
    reason?: string
  ): Promise<void> {
    const current = getLocalCertificates();
    const index = current.findIndex((c) => c.id === id || c.certificateId === id);
    if (index !== -1) {
      current[index] = {
        ...current[index],
        status,
        revocationReason: reason,
        revokedAt: status === "REVOKED" ? new Date() : undefined,
        updatedAt: new Date(),
      };
      saveLocalCertificates(current);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "certificates", id), stripUndefined({
          status,
          revocationReason: reason,
          revokedAt: status === "REVOKED" ? new Date() : undefined,
          updatedAt: new Date(),
        }));
      } catch (err) {
        console.error("Firestore update certificate failed:", err);
      }
    }
  },
};
