import type {
  Participant,
  Certificate,
  CertificateTemplate,
  EmailTemplate,
  Campaign,
  AuditLog,
} from "@/types";

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const INITIAL_CERTIFICATES: Certificate[] = [];

export const INITIAL_CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: "tpl-default-01",
    name: "NSOC Official Executive Gold",
    description: "Official sleek dark-mode certificate with gold foil accents and QR stamp.",
    htmlContent: `<div class="cert-card">
  <div class="cert-border">
    <div class="cert-header">
      <div class="cert-badge">NSOC 2026 OFFICIAL CREDENTIAL</div>
      <h1 class="cert-title">CERTIFICATE OF RECOGNITION</h1>
      <p class="cert-subtitle">This certificate is proudly awarded to</p>
    </div>
    <div class="cert-body">
      <div class="recipient-name">{{recipient_name}}</div>
      <p class="cert-track">for exemplary merit and distinguished achievement as</p>
      <div class="award-type">{{certificate_type}}</div>
      <p class="cert-desc">{{contribution_details}}</p>
    </div>
    <div class="cert-footer">
      <div class="sig-block">
        <div class="sig-line">{{signatory_name}}</div>
        <div class="sig-title">{{signatory_title}}</div>
      </div>
      <div class="cert-qr-block">
        <img src="{{qr_code_url}}" alt="QR Code" class="cert-qr" />
        <div class="cert-code">ID: {{certificate_id}}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line">{{issue_date}}</div>
        <div class="sig-title">Date of Issue</div>
      </div>
    </div>
  </div>
</div>`,
    cssContent: `.cert-card {
  width: 100%;
  aspect-ratio: 16 / 10.5;
  background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #09090b 100%);
  color: #f8fafc;
  padding: 32px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
}
.cert-border {
  flex: 1;
  border: 2px solid rgba(234, 179, 8, 0.4);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 30px rgba(234, 179, 8, 0.1);
  text-align: center;
}
.cert-badge {
  font-size: 11px;
  letter-spacing: 3px;
  color: #fbbf24;
  font-weight: 700;
  margin-bottom: 8px;
}
.cert-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cert-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
.recipient-name {
  font-size: 32px;
  font-weight: 800;
  color: #facc15;
  margin: 14px 0 6px 0;
  letter-spacing: 1px;
}
.cert-track {
  font-size: 12px;
  color: #94a3b8;
  margin: 4px 0;
}
.award-type {
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
  color: #38bdf8;
  border-bottom: 1px solid rgba(56, 189, 248, 0.3);
  padding-bottom: 4px;
  margin-bottom: 8px;
}
.cert-desc {
  font-size: 12px;
  color: #cbd5e1;
  max-width: 600px;
  margin: 0 auto;
}
.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 16px;
}
.sig-block {
  text-align: left;
}
.sig-line {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  border-bottom: 1px solid #475569;
  padding-bottom: 4px;
  min-width: 140px;
}
.sig-title {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}
.cert-qr-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cert-qr {
  width: 58px;
  height: 58px;
  border-radius: 6px;
  background: #ffffff;
  padding: 3px;
}
.cert-code {
  font-family: monospace;
  font-size: 9px;
  color: #fbbf24;
  margin-top: 4px;
}`,
    variables: [
      "recipient_name",
      "certificate_type",
      "contribution_details",
      "signatory_name",
      "signatory_title",
      "qr_code_url",
      "certificate_id",
      "issue_date",
    ],
    isActive: true,
    isDefault: true,
    version: 1,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-03-01"),
  },
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "etpl-01",
    name: "Official Certificate Issuance Notification",
    subject: "Your Official NSOC 2026 Certificate is Ready — {{recipient_name}}",
    htmlBody: `<div style="font-family: sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6366f1; margin: 0; font-size: 24px;">NSOC 2026</h2>
    <p style="color: #94a3b8; font-size: 14px;">National Students Open-Source Conference</p>
  </div>
  <p style="font-size: 16px;">Dear {{recipient_name}},</p>
  <p style="color: #cbd5e1; line-height: 1.6;">
    Congratulations on your participation and distinguished contribution to <strong>NSOC 2026</strong>.
    Your official digitally signed credential has been generated and anchored on the platform.
  </p>
  <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #6366f1;">
    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Credential Identifier</div>
    <div style="font-size: 20px; font-weight: bold; color: #f8fafc; font-family: monospace;">{{certificate_id}}</div>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{verification_url}}" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
      View & Verify Certificate
    </a>
  </div>
  <p style="font-size: 12px; color: #64748b; text-align: center;">
    This is an automated dispatch from NSOC 2026 Official Platform. Do not reply to this email.
  </p>
</div>`,
    plainTextBody: `Dear {{recipient_name}},\n\nCongratulations on your participation in NSOC 2026!\nYour certificate ID is: {{certificate_id}}\nVerify online at: {{verification_url}}`,
    variables: ["recipient_name", "certificate_id", "verification_url"],
    isActive: true,
    isDefault: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-15"),
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
