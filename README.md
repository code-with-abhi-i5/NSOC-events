# NSOC 2026 — Event Management & Certificate Verification Platform

A production-ready SaaS platform for the **National Students Open-Source Conference (NSOC 2026)** built with React, TypeScript, Tailwind CSS v4, and Firebase.

![NSOC Platform](https://img.shields.io/badge/NSOC-2026-6366f1?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-v12-ffca28?style=for-the-badge&logo=firebase)

---

## 🚀 Key Features

### 1. Public Portal & Certificate Verification
- **Futuristic Dark-Mode Landing Page**: Dynamic hero with glowing mesh accents, animated metrics counters, feature matrix, and FAQ accordion.
- **Cryptographic Verification Search**: Direct lookup via certificate identifier (e.g., `NSOC26-WIN-001`) with automatic normalization and validation.
- **Verification Details (`/verify/:certificateId`)**: Comprehensive state representation (`VALID`, `REVOKED`, `NOT_FOUND`), QR code verification stamp, recipient metadata, and social sharing.
- **Interactive Certificate Preview**: High-fidelity visual modal with authentic seal, signatory lines, QR code, and print/download actions.
- **Event Information Page (`/event`)**: Schedule, organizer profile, tracks, and contact details.

### 2. Admin Control Center & Operations
- **Real-Time Telemetry Dashboard**: Issuance velocity charts, verification trends (via Recharts), rapid action triggers, and live audit streams.
- **Participant Roster & Batch Ingestion**:
  - Full table with search and filtering by certificate category / status.
  - CSV / XLSX bulk import parser with live preview and column mapper.
  - One-click individual or bulk certificate issuance.
- **Authoritative Certificate Ledger**:
  - Comprehensive registry of all generated credentials.
  - Instant revoke / reactivate toggle with confirmation guards.
  - Export full registry as compliant CSV.
- **Template Customizer Studio**:
  - Live HTML/CSS certificate engine with token interpolation (`{{recipient_name}}`, `{{certificate_id}}`, `{{qr_code_url}}`).
  - Interactive preview and instant stylesheet edits.
- **Email Delivery & Campaign Dispatch**:
  - Transactional email editor with rendered preview.
  - Bulk campaign wizard targeting specific recipient cohorts (Winners, General Participants).
  - Throttled delivery progress bars and metrics.
- **Analytics & Reporting**:
  - Category distribution pie charts and volume trends.
  - Exportable executive analytics summary.
- **Audit Compliance Trail**:
  - Immutable chronological log of administrative operations with IP and timestamp metadata.
- **Role-Based Access Control**:
  - Guarded routes with `ADMIN`, `ORGANIZER`, and `VIEWER` permission levels.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Core** | React 19, TypeScript 6, Vite 8 |
| **Routing** | React Router v7 with Suspense lazy-loading & ProtectedRoute guards |
| **Styling & UI** | Tailwind CSS v4, custom design tokens, OKLCH color palettes, Sonner notifications |
| **Animations** | Framer Motion |
| **Visualization** | Recharts (Area charts, Bar charts, Pie charts) |
| **Credential Generation** | QRCode.js (dynamic vector QR encoding) |
| **Backend & Cloud** | Firebase Auth, Cloud Firestore, Cloud Storage, Cloud Functions |
| **Email Service** | Resend API abstraction with Cloud Functions isolation |

---

## 💻 Getting Started

### 1. Clone & Install
```bash
cd "nsoc event"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_APP_URL=http://localhost:5173
VITE_VERIFICATION_DOMAIN=http://localhost:5173
```
> **Note:** If `.env` is omitted or unconfigured during development, the platform **gracefully operates in resilient demo mode** with pre-populated NSOC 2026 data, instant admin sign-in, and local persistence!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Live Production URL
- **Production Website**: [https://nsoc-events.vercel.app](https://nsoc-events.vercel.app)
- **Certificate Verification Terminal**: [https://nsoc-events.vercel.app/verify](https://nsoc-events.vercel.app/verify)
- **Admin Portal**: [https://nsoc-events.vercel.app/admin/login](https://nsoc-events.vercel.app/admin/login)

### 5. Build for Production
```bash
npm run build
```

---

## 🔐 Demo Credentials & Verification Identifiers

- **Admin Login**: [https://nsoc-events.vercel.app/admin/login](https://nsoc-events.vercel.app/admin/login)
  - Pre-filled: `admin@nsoc.dev` (or click *Sign In* / *Continue with Google*)
- **Sample Certificate IDs to Verify**:
  - `NSOC26-WIN-001` (1st Place Winner)
  - `NSOC26-RUN-002` (2nd Place Runner Up)
  - `NSOC26-PAR-042` (Participation)

---

## 🔒 Security Architecture
- **No Client Secrets**: API keys for external transactional providers (Resend, SendGrid) are encapsulated in Cloud Functions.
- **Production Firestore Rules**: Authenticated organizer/admin write rules, public read for active certificates.
- **Audit Logs**: Immutable records of every issuance, revocation, and campaign dispatch.
