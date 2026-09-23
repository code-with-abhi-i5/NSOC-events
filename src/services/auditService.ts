import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import type { AuditLog } from "@/types";

const STORAGE_KEY = "nsoc_audit_logs_v2";

// Clear legacy mock cache if present
if (typeof window !== "undefined" && localStorage.getItem("nsoc_audit_logs_cache")) {
  localStorage.removeItem("nsoc_audit_logs_cache");
}

function getLocalAuditLogs(): AuditLog[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data, (key, value) => {
      if (key === "timestamp") return new Date(value);
      return value;
    });
  } catch {
    return [];
  }
}

export const auditService = {
  async getAll(): Promise<AuditLog[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "auditLogs"));
        return querySnapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            ...d,
            id: docSnap.id,
            timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp),
          } as AuditLog;
        });
      } catch (err) {
        console.warn("Firestore fetch audit logs failed:", err);
      }
    }
    return getLocalAuditLogs();
  },

  async log(params: {
    actor: { userId: string; email: string; displayName: string };
    action: string;
    target?: string;
    details?: string;
    result?: "SUCCESS" | "FAILURE";
  }): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: "aud-" + Math.random().toString(36).substring(2, 9),
      actor: params.actor,
      action: params.action,
      target: params.target,
      details: params.details,
      result: params.result || "SUCCESS",
      ipAddress: "127.0.0.1",
      timestamp: new Date(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "auditLogs", newLog.id), newLog);
      } catch (err) {
        console.warn("Firestore save audit log failed:", err);
      }
    }

    const current = getLocalAuditLogs();
    current.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return newLog;
  },
};
