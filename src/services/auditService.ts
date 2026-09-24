import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import type { AuditLog } from "@/types";

const STORAGE_KEY = "nsoc_audit_logs_v2";

function stripUndefined<T extends Record<string, any>>(obj: T): any {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
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
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              ...d,
              id: docSnap.id,
              timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : d.timestamp ? new Date(d.timestamp) : new Date(),
            } as AuditLog;
          });
          // Sort chronologically descending (newest first)
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          return list;
        }
      } catch (err) {
        console.warn("Firestore fetch audit logs failed, falling back to local:", err);
      }
    }
    const local = getLocalAuditLogs();
    local.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return local;
  },

  async log(params: {
    actor: { userId: string; email: string; displayName: string };
    action: string;
    target?: string;
    details?: string;
    result?: "SUCCESS" | "FAILURE";
  }): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: "aud-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7),
      actor: params.actor || { userId: "admin", email: "admin@nsoc.dev", displayName: "Administrator" },
      action: params.action,
      target: params.target,
      details: params.details,
      result: params.result || "SUCCESS",
      ipAddress: "127.0.0.1",
      timestamp: new Date(),
    };

    const current = getLocalAuditLogs();
    current.unshift(newLog);
    // Keep last 250 records in local cache to prevent localStorage quota overflows
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, 250)));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "auditLogs", newLog.id), stripUndefined(newLog));
      } catch (err) {
        console.error("Firestore save audit log failed:", err);
      }
    }

    return newLog;
  },
};
