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

function stripUndefined<T extends Record<string, any>>(obj: T): any {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
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
        const firestoreList = querySnapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            ...d,
            id: docSnap.id,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
          } as Participant;
        });
        firestoreList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Directly sync local storage with Firestore source of truth
        saveLocalParticipants(firestoreList);
        return firestoreList;
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

    // Always update local cache first for instant UI response
    const current = getLocalParticipants();
    current.unshift(newParticipant);
    saveLocalParticipants(current);

    if (isFirebaseConfigured && db) {
      try {
        // Strip undefined fields (Firestore throws invalid-argument if undefined is present)
        await setDoc(doc(db, "participants", id), stripUndefined(newParticipant));
      } catch (err) {
        console.error("Firestore add participant failed:", err);
      }
    }

    return newParticipant;
  },

  async bulkAdd(participants: Omit<Participant, "id" | "createdAt" | "updatedAt">[]): Promise<number> {
    const items = participants.map((p) => ({
      ...p,
      id: "p-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const current = getLocalParticipants();
    saveLocalParticipants([...items, ...current]);

    if (isFirebaseConfigured && db) {
      try {
        for (const item of items) {
          await setDoc(doc(db, "participants", item.id), stripUndefined(item));
        }
      } catch (err) {
        console.error("Firestore bulk add failed:", err);
      }
    }

    return items.length;
  },

  async update(id: string, updates: Partial<Participant>): Promise<void> {
    const current = getLocalParticipants();
    const index = current.findIndex((p) => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updatedAt: new Date() };
      saveLocalParticipants(current);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "participants", id), stripUndefined({
          ...updates,
          updatedAt: new Date(),
        }));
      } catch (err) {
        console.error("Firestore update participant failed:", err);
      }
    }
  },

  async updateStatus(id: string, status: ParticipantStatus): Promise<void> {
    await this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const current = getLocalParticipants().filter((p) => p.id !== id);
    saveLocalParticipants(current);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "participants", id));
      } catch (err) {
        console.error("Firestore delete participant failed:", err);
      }
    }
  },
};
