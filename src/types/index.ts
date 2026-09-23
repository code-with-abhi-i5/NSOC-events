// ============================================
// NSOC Events — Shared Type Definitions
// ============================================

export type UserRole = "ADMIN" | "ORGANIZER" | "VIEWER";

export type CertificateStatus = "ACTIVE" | "REVOKED" | "REISSUED" | "PENDING";

export type ParticipantStatus =
  | "PENDING"
  | "CERTIFICATE_GENERATED"
  | "EMAIL_SENT"
  | "VERIFIED";

export type EmailJobStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "BOUNCED"
  | "FAILED";

export type CampaignStatus =
  | "DRAFT"
  | "QUEUED"
  | "PROCESSING"
  | "PAUSED"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED";

export type VerificationResult = "VALID" | "REVOKED" | "NOT_FOUND";

// ---- Firestore Document Types ----

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  teamName?: string;
  certificateType: string;
  rank?: number;
  eventId: string;
  eventYear: number;
  certificateId?: string;
  status: ParticipantStatus;
  emailStatus: EmailJobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  certificateId: string; // e.g. NSOC26-A7B3F2E1
  participantId: string;
  participantName: string;
  teamName?: string;
  eventId: string;
  eventName: string;
  eventYear: number;
  certificateType: string;
  templateId: string;
  status: CertificateStatus;
  issuedAt?: Date;
  revokedAt?: Date;
  reissuedAt?: Date;
  pdfUrl?: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
  rank?: number;
  contributionDetails?: string;
  organizerName: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  htmlContent: string;
  cssContent: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  version: number;
  previousVersions?: { htmlContent: string; cssContent: string; version: number; updatedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  emailTemplateId: string;
  eventId: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  bounced: number;
  status: CampaignStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailJob {
  id: string;
  campaignId: string;
  participantId: string;
  certificateId: string;
  recipientEmail: string;
  recipientName: string;
  status: EmailJobStatus;
  attempts: number;
  lastAttemptAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  actor: {
    userId: string;
    email: string;
    displayName: string;
  };
  action: string;
  target?: string;
  details?: string;
  result: "SUCCESS" | "FAILURE";
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface VerificationLog {
  id: string;
  certificateId: string;
  ipAddress?: string;
  userAgent?: string;
  result: VerificationResult;
  timestamp: Date;
}

export interface EventSettings {
  name: string;
  fullName: string;
  year: number;
  description: string;
  logo?: string;
  website?: string;
  primaryColor: string;
  accentColor: string;
  certificatePrefix: string;
  verificationDomain: string;
  organizerName: string;
  contactEmail: string;
  socialLinks: Record<string, string>;
  footerText: string;
  dates: {
    start: string;
    end: string;
    certificateIssue: string;
  };
  signature?: string;
  defaultCertificateTemplateId?: string;
  defaultEmailTemplateId?: string;
}

// ---- Component Props ----

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

export interface StatCardData {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// ---- Utility Types ----

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterState {
  field: string;
  value: string | string[];
}
