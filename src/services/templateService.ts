import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import type { CertificateTemplate, EmailTemplate } from "@/types";
import { INITIAL_CERTIFICATE_TEMPLATES, INITIAL_EMAIL_TEMPLATES } from "./mockData";

const CERT_TPL_KEY = "nsoc_cert_templates";
const EMAIL_TPL_KEY = "nsoc_email_templates";

export const templateService = {
  async getCertificateTemplates(): Promise<CertificateTemplate[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "certificateTemplates"));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map((d) => d.data() as CertificateTemplate);
        }
      } catch (err) {
        console.warn("Firestore cert templates fetch error, using local:", err);
      }
    }
    const data = localStorage.getItem(CERT_TPL_KEY);
    if (!data) {
      localStorage.setItem(CERT_TPL_KEY, JSON.stringify(INITIAL_CERTIFICATE_TEMPLATES));
      return INITIAL_CERTIFICATE_TEMPLATES;
    }
    return JSON.parse(data);
  },

  async saveCertificateTemplate(template: CertificateTemplate): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "certificateTemplates", template.id), template);
      } catch (err) {
        console.warn("Firestore save cert template error:", err);
      }
    }
    const templates = await this.getCertificateTemplates();
    const idx = templates.findIndex((t) => t.id === template.id);
    if (idx !== -1) {
      templates[idx] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(CERT_TPL_KEY, JSON.stringify(templates));
  },

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "emailTemplates"));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map((d) => d.data() as EmailTemplate);
        }
      } catch (err) {
        console.warn("Firestore email templates fetch error, using local:", err);
      }
    }
    const data = localStorage.getItem(EMAIL_TPL_KEY);
    if (!data) {
      localStorage.setItem(EMAIL_TPL_KEY, JSON.stringify(INITIAL_EMAIL_TEMPLATES));
      return INITIAL_EMAIL_TEMPLATES;
    }
    return JSON.parse(data);
  },

  async saveEmailTemplate(template: EmailTemplate): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "emailTemplates", template.id), template);
      } catch (err) {
        console.warn("Firestore save email template error:", err);
      }
    }
    const templates = await this.getEmailTemplates();
    const idx = templates.findIndex((t) => t.id === template.id);
    if (idx !== -1) {
      templates[idx] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(EMAIL_TPL_KEY, JSON.stringify(templates));
  },
};
