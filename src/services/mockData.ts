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
    id: "tpl-codeathon-20",
    name: "CODE-A-THON 2.0 Official Landscape",
    description: "Official CODE-A-THON 2.0 landscape certificate with top sponsor logos, wave accents, dynamic recipient name, and authoritative signatures.",
    htmlContent: `<div class="cert">
  <!-- Corner waves -->
  <svg class="wave tr" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
    <path d="M280,0 L280,240 C230,230 170,190 130,140 C90,90 60,50 0,15 L0,0 Z" fill="#1e3a8a" opacity="0.9"/>
    <path d="M280,0 L280,200 C235,190 180,155 145,110 C110,65 80,35 20,8 L0,0 Z" fill="#facc15" opacity="0.85"/>
  </svg>
  <svg class="wave bl" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,240 L0,0 C50,10 110,50 150,100 C190,150 220,190 280,225 L280,240 Z" fill="#1e3a8a" opacity="0.9"/>
    <path d="M0,240 L0,40 C45,50 100,85 135,130 C170,175 200,205 260,232 L280,240 Z" fill="#facc15" opacity="0.85"/>
  </svg>

  <!-- Top 5 logos -->
  <div class="logos">
    <img class="nexus-logo" src="https://avatars.githubusercontent.com/u/264619437?s=280" alt="Nexus">
    <img src="https://placehold.co/100x36/ffffff/0c1a3a?text=Sigma+Fusion&font=roboto" alt="Sigma Fusion">
    <img src="https://placehold.co/100x36/ffffff/0c1a3a?text=Meander&font=roboto" alt="Meander">
    <img src="https://placehold.co/100x36/ffffff/0c1a3a?text=DSO&font=roboto" alt="DSO">
    <img src="https://placehold.co/100x36/ffffff/0c1a3a?text=MACBEASE&font=roboto" alt="Macbease">
  </div>

  <!-- Event Title -->
  <div class="event">
    <h1>CODE-A-THON <span class="v2">2.0</span></h1>
    <div class="subtitle">24-Hour Hackathon</div>
  </div>

  <!-- Certificate Label -->
  <div class="label">
    <h2>Certificate</h2>
    <div class="sub">
      <span class="line"></span>
      <span>{{certificate_type_sub}}</span>
      <span class="line"></span>
    </div>
  </div>

  <!-- Recipient -->
  <div class="recipient">
    <div class="pre">This certificate is proudly presented to</div>
    <div class="name">{{recipient_name}}</div>
    {{team_block}}
  </div>

  <!-- Description -->
  <div class="desc">
    for actively participating in <strong>CODE-A-THON 2.0 – 24-Hour Hackathon</strong>, organized by <strong>Nexus Spring of Code</strong> in collaboration with <strong>Sigma Fusion</strong>, <strong>Meander</strong>, <strong>DSO</strong>, and <strong>Macbease</strong>, held on <strong>25–26 September 2026</strong>.
  </div>

  <!-- Footer (2 Signatures + QR) -->
  <div class="footer">
    <div class="sig">
      <div class="sign">{{signatory_name}}</div>
      <div class="line"></div>
      <div class="name">{{signatory_name}}</div>
      <div class="role">{{signatory_title}}</div>
    </div>

    <div class="qr">
      <img src="{{qr_code_url}}" alt="QR">
      <div class="cert-id">{{certificate_id}}</div>
      <div class="scan">Scan to Verify</div>
    </div>

    <div class="sig">
      <div class="sign">Dr. R. K. Sharma</div>
      <div class="line"></div>
      <div class="name">Dr. R. K. Sharma</div>
      <div class="role">Dean, Student Welfare</div>
    </div>
  </div>
</div>`,
    cssContent: `.cert {
  position: relative;
  width: 1000px;
  max-width: 100%;
  aspect-ratio: 1.414 / 1;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 20px 50px -10px rgba(0, 50, 120, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 30px 50px 24px 50px;
  color: #0c1a3a;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  justify-content: space-between;
}
.wave {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}
.wave.tr { top: 0; right: 0; width: 280px; }
.wave.bl { bottom: 0; left: 0; width: 280px; }
.logos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  z-index: 5;
}
.logos img {
  max-height: 36px;
  width: auto;
  object-fit: contain;
}
.logos img.nexus-logo {
  border-radius: 4px;
}
.event {
  text-align: center;
  margin-top: 14px;
  position: relative;
  z-index: 5;
}
.event h1 {
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #0c1a3a;
  line-height: 1;
  text-transform: uppercase;
  margin: 0;
}
.event h1 .v2 {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-style: italic;
}
.event .subtitle {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #2563eb;
  margin-top: 8px;
  text-transform: uppercase;
}
.label {
  text-align: center;
  margin-top: 16px;
  position: relative;
  z-index: 5;
}
.label h2 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 6px;
  color: #0c1a3a;
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
}
.label .sub {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}
.label .sub .line {
  width: 55px;
  height: 2px;
  background: #ea580c;
}
.label .sub span {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 6px;
  color: #ea580c;
  text-transform: uppercase;
}
.recipient {
  text-align: center;
  margin-top: 14px;
  position: relative;
  z-index: 5;
}
.recipient .pre {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}
.recipient .name {
  font-family: 'Playfair Display', serif;
  font-size: 46px;
  font-weight: 800;
  color: #0c1a3a;
  letter-spacing: 1px;
  line-height: 1.1;
  margin: 0;
}
.recipient .team {
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  margin-top: 4px;
}
.desc {
  text-align: center;
  font-size: 12.5px;
  line-height: 1.6;
  color: #475569;
  max-width: 740px;
  margin: 10px auto 0 auto;
  position: relative;
  z-index: 5;
}
.desc strong { color: #0c1a3a; font-weight: 700; }
.footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 14px;
  position: relative;
  z-index: 5;
  gap: 20px;
}
.sig {
  text-align: center;
  flex: 1;
  min-width: 170px;
}
.sig .sign {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 22px;
  color: #0c1a3a;
  margin-bottom: 2px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sig .line {
  width: 170px;
  height: 1px;
  background: #94a3b8;
  margin: 0 auto 6px auto;
}
.sig .name {
  font-size: 12px;
  font-weight: 800;
  color: #0c1a3a;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.sig .role {
  font-size: 9px;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
.qr {
  text-align: center;
  flex-shrink: 0;
}
.qr img {
  width: 70px;
  height: 70px;
  padding: 3px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  display: block;
  margin: 0 auto;
}
.qr .cert-id {
  font-family: monospace;
  font-size: 9px;
  font-weight: 700;
  color: #0c1a3a;
  margin-top: 4px;
  letter-spacing: 0.5px;
}
.qr .scan {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #3b82f6;
  text-transform: uppercase;
  margin-top: 2px;
}
@media (max-width: 800px) {
  .cert { padding: 20px 26px 18px 26px; }
  .event h1 { font-size: 34px; }
  .label h2 { font-size: 24px; letter-spacing: 3px; }
  .label .sub span { font-size: 10px; letter-spacing: 4px; }
  .recipient .name { font-size: 30px; }
  .desc { font-size: 11px; }
  .logos img { max-height: 24px; }
  .wave.tr, .wave.bl { width: 160px; }
  .footer { flex-wrap: wrap; gap: 14px; justify-content: center; }
  .sig { flex: 0 1 45%; }
  .sig .line { width: 130px; }
}`,
    variables: [
      "recipient_name",
      "certificate_type_sub",
      "certificate_type",
      "contribution_details",
      "signatory_name",
      "signatory_title",
      "qr_code_url",
      "certificate_id",
      "team_block",
      "issue_date",
    ],
    isActive: true,
    isDefault: true,
    version: 2,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-09-24"),
  },
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "etpl-codeathon-20",
    name: "CODE-A-THON 2.0 Official Credential Dispatch",
    subject: "Official CODE-A-THON 2.0 Certificate: {{recipient_name}} [{{certificate_id}}]",
    htmlBody: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #060913; margin: 0; padding: 30px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #0d1527; border-radius: 16px; border: 1px solid #1e2e4a; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
        <tr>
          <td style="background: linear-gradient(135deg, #090e1a 0%, #1e3a8a 50%, #090e1a 100%); padding: 36px 30px 28px 30px; text-align: center; border-bottom: 1px solid #1e3a8a;">
            <div style="margin-bottom: 14px;">
              <img src="https://avatars.githubusercontent.com/u/264619437?s=280" width="54" height="54" alt="Nexus" style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.25); display: inline-block; vertical-align: middle;" />
            </div>
            <div>
              <span style="display: inline-block; background-color: rgba(37, 99, 235, 0.25); border: 1px solid #3b82f6; color: #93c5fd; font-size: 11px; font-weight: 800; letter-spacing: 2px; padding: 4px 14px; border-radius: 50px; text-transform: uppercase;">
                Official Digital Credential
              </span>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 1px; margin: 16px 0 6px 0; text-transform: uppercase; line-height: 1.1;">
              CODE-A-THON <span style="color: #60a5fa;">2.0</span>
            </h1>
            <p style="color: #94a3b8; font-size: 13px; font-weight: 600; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
              24-Hour Hackathon | Nexus Spring of Code
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 30px;">
            <p style="color: #f1f5f9; font-size: 17px; font-weight: 700; margin: 0 0 14px 0;">
              Dear {{recipient_name}},
            </p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
              Congratulations on your outstanding performance in <strong>CODE-A-THON 2.0 (24-Hour Hackathon)</strong> organized by <strong>Nexus Spring of Code</strong> in collaboration with <strong>Sigma Fusion, Meander, DSO, and Macbease</strong>. Your dedication and technical innovation have been officially verified and recorded.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #111a2e; border: 1px solid #1e2e4a; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
              <tr>
                <td style="padding: 20px;">
                  <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                    Certificate Identifier
                  </div>
                  <div style="font-size: 22px; font-family: monospace; font-weight: 900; color: #fbbf24; letter-spacing: 1px; margin-bottom: 16px;">
                    {{certificate_id}}
                  </div>
                  <table role="presentation" width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px; border-top: 1px solid #1e2e4a; padding-top: 12px;">
                    <tr>
                      <td style="color: #94a3b8; width: 35%; padding: 6px 0;">Recipient:</td>
                      <td style="color: #ffffff; font-weight: 700; padding: 6px 0;">{{recipient_name}}</td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0;">Category:</td>
                      <td style="color: #e2e8f0; font-weight: 600; padding: 6px 0;">Certificate of Participation</td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; padding: 6px 0;">Status:</td>
                      <td style="color: #34d399; font-weight: 700; padding: 6px 0;">Active &amp; Authenticated</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 14px 18px;">
                  <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-right: 8px;">
                    PDF Attached
                  </span>
                  <strong style="color: #34d399; font-size: 13px;">Official Landscape Certificate Included</strong>
                  <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0; line-height: 1.5;">
                    Your high-resolution PDF certificate with digital signatures and QR verification is attached directly to this email.
                  </p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
              <tr>
                <td align="center">
                  <a href="{{verification_url}}" style="background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; display: inline-block; text-transform: uppercase; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45); border: 1px solid #3b82f6;">
                    Verify Certificate Online
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0; line-height: 1.6;">
              Direct Verification URL:<br />
              <a href="{{verification_url}}" style="color: #38bdf8; text-decoration: underline; word-break: break-all;">{{verification_url}}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #080d19; padding: 24px 30px; border-top: 1px solid #1e293b; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0 0 8px 0;">
              <strong style="color: #e2e8f0;">Nexus Spring of Code</strong> | 
              In collaboration with <strong style="color: #cbd5e1;">Sigma Fusion, Meander, DSO, Macbease</strong>
            </p>
            <p style="font-size: 10px; color: #64748b; margin: 0 0 12px 0;">
              Signatories: Aman Singh (Founder) &bull; Dr. R. K. Sharma (Dean, Student Welfare)
            </p>
            <p style="color: #475569; font-size: 10px; margin: 0; line-height: 1.5;">
              Automated credential dispatch from the official NSOC verification registry.<br />
              All rights reserved &copy; 2026 Nexus Spring of Code.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
    plainTextBody: `Dear {{recipient_name}},\n\nCongratulations on your participation in CODE-A-THON 2.0 (24-Hour Hackathon)!\nYour certificate ID is: {{certificate_id}}\nVerify online at: {{verification_url}}\n(Official PDF Certificate is attached to this email)`,
    variables: ["recipient_name", "certificate_id", "verification_url"],
    isActive: true,
    isDefault: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-09-24"),
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
