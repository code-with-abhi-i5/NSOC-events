import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import type { Participant, ParticipantStatus } from "@/types";

const STORAGE_KEY = "nsoc_participants_v2";

// Clear legacy mock cache if present
if (typeof window !== "undefined" && localStorage.getItem("nsoc_participants_cache")) {
  localStorage.removeItem("nsoc_participants_cache");
}

function getLocalParticipants(): Participant[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data, (key, value) => {
      if (key === "createdAt" || key === "updatedAt") {
        return new Date(value);
      }
      return value;
    });
  } catch {
    return [];
  }
}

function saveLocalParticipants(items: Participant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const participantService = {
  async getAll(): Promise<Participant[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "participants"));
        return querySnapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            ...d,
            id: docSnap.id,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
          } as Participant;
        });
      } catch (err) {
        console.warn("Firestore fetch participants failed, falling back to local:", err);
      }
    }
    return getLocalParticipants();
  },

  async add(participant: Omit<Participant, "id" | "createdAt" | "updatedAt">): Promise<Participant> {
    const id = "p-" + Math.random().toString(36).substring(2, 9);
    const newParticipant: Participant = {
      ...participant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "participants", id), newParticipant);
        return newParticipant;
      } catch (err) {
        console.warn("Firestore add participant failed, saving local:", err);
      }
    }

    const current = getLocalParticipants();
    current.unshift(newParticipant);
    saveLocalParticipants(current);
    return newParticipant;
  },

  async bulkAdd(participants: Omit<Participant, "id" | "createdAt" | "updatedAt">[]): Promise<number> {
    const items = participants.map((p) => ({
      ...p,
      id: "p-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (isFirebaseConfigured && db) {
      try {
        for (const item of items) {
          await setDoc(doc(db, "participants", item.id), item);
        }
        return items.length;
      } catch (err) {
        console.warn("Firestore bulk add failed, saving local:", err);
      }
    }

    const current = getLocalParticipants();
    saveLocalParticipants([...items, ...current]);
    return items.length;
  },

  async update(id: string, updates: Partial<Participant>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "participants", id), {
          ...updates,
          updatedAt: new Date(),
        });
        return;
      } catch (err) {
        console.warn("Firestore update participant failed, saving local:", err);
      }
    }

    const current = getLocalParticipants();
    const index = current.findIndex((p) => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updatedAt: new Date() };
      saveLocalParticipants(current);
    }
  },

  async updateStatus(id: string, status: ParticipantStatus): Promise<void> {
    await this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "participants", id));
        return;
      } catch (err) {
        console.warn("Firestore delete participant failed, removing local:", err);
      }
    }

    const current = getLocalParticipants().filter((p) => p.id !== id);
    saveLocalParticipants(current);
  },
};
