// NSOC Events — Centralized Event Configuration
// Change these values to rebrand the platform for any event/year

export const eventConfig = {
  // Organization
  name: "NSOC",
  fullName: "Nexus Spring of Code",
  year: 2026,
  description:
    "An open-source event management and certification platform designed to recognize and celebrate contributions.",

  // Branding
  logo: "/nsoc-logo.svg",
  website: "https://nsoc.dev",
  primaryColor: "#6366f1", // Indigo-500
  accentColor: "#8b5cf6", // Violet-500

  // Certificate
  certificatePrefix: "NSOC",
  certificateIdLength: 8, // hex characters after prefix+year

  // Verification
  verificationDomain:
    import.meta.env.VITE_VERIFICATION_DOMAIN || "http://localhost:5173",

  // Contact
  contactEmail: "team@nsoc.dev",
  socialLinks: {
    github: "https://github.com/nsoc",
    twitter: "https://twitter.com/nsoc",
    linkedin: "https://linkedin.com/company/nsoc",
    discord: "https://discord.gg/nsoc",
  },

  // Event Dates
  dates: {
    start: "2026-01-15",
    end: "2026-03-15",
    certificateIssue: "2026-03-20",
  },

  // Organizer
  organizer: {
    name: "NSOC Team",
    signature: "/signature.png",
  },

  // Footer
  footerText: "© 2026 Nexus Spring of Code. All rights reserved.",
  subtitle: "Open Source Event Management & Certification Platform",
} as const;

export type EventConfig = typeof eventConfig;
