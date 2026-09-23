import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Shield,
  Mail,
  Users,
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Search,
  ChevronDown,
  Lock,
  QrCode,
  CheckCircle2,
  FileCheck,
  Layers,
  Cpu,
} from "lucide-react";
import { eventConfig } from "@/config/eventConfig";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { certificateService } from "@/services/certificateService";
import { participantService } from "@/services/participantService";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const features = [
  {
    icon: Award,
    title: "Cryptographic Credentialing",
    description:
      "High-fidelity digital certificates anchored with unique SHA-256 verifiable signatures and tamper-evident identifiers.",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  },
  {
    icon: QrCode,
    title: "Instant QR Code Verification",
    description:
      "Every certificate bears an authoritative QR code. Recruiters and universities can scan and verify legitimacy in seconds.",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    icon: Zap,
    title: "100% Free Sovereign Architecture",
    description:
      "Zero infrastructure hosting costs. Powered by client-side canvas rendering and Google Apps Script transactional mailer.",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    icon: Mail,
    title: "Automated Gmail Delivery",
    description:
      "Automated transactional dispatch straight to attendees' inboxes with personalized verification anchors and preview links.",
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    icon: Users,
    title: "Participant & Team Management",
    description:
      "Bulk roster import via CSV/Excel, automated team grouping, and granular credential issuance pipelines.",
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
  },
  {
    icon: Globe,
    title: "Open Source Freedom",
    description:
      "Fully sovereign and customizable platform built for universities, community hackathons, and global open-source summits.",
    color: "from-blue-500/20 to-sky-500/20 text-blue-400 border-blue-500/30",
  },
];

const certificateTiers = [
  {
    id: "winner",
    label: "🥇 Winner Edition",
    title: "CERTIFICATE OF EXCELLENCE",
    subtitle: "GRAND PRIZE WINNER",
    recipient: "Abhijeet Ghosh",
    track: "Winner - 1st Place • AI & Autonomous Agent Systems",
    citation:
      "In formal recognition of extraordinary technical innovation, pioneering system architecture, and exemplary execution during the National Students Open-Source Conference 2026.",
    certId: "NSOC26-WIN-001",
    theme: {
      border: "border-amber-400/50 shadow-amber-500/10",
      accent: "text-amber-300",
      badgeBg: "bg-amber-400/15 border-amber-400/30 text-amber-300",
      ribbonText: "★ OFFICIAL 1ST PLACE WINNER ★",
      glow: "from-amber-500/20 via-orange-500/10 to-amber-500/20",
      corner: "border-amber-400",
    },
  },
  {
    id: "runnerup",
    label: "🥈 Runner-Up Edition",
    title: "CERTIFICATE OF INNOVATION",
    subtitle: "RUNNER-UP RECOGNITION",
    recipient: "Priya Sharma",
    track: "Runner-Up - 2nd Place • Web3 & Cryptographic Primitives",
    citation:
      "Conferred for exceptional engineering prowess, outstanding teamwork, and significant contributions to sovereign zero-knowledge architecture.",
    certId: "NSOC26-RUN-002",
    theme: {
      border: "border-slate-300/50 shadow-cyan-500/10",
      accent: "text-slate-200",
      badgeBg: "bg-slate-300/15 border-slate-300/30 text-slate-200",
      ribbonText: "★ OFFICIAL 2ND PLACE RUNNER-UP ★",
      glow: "from-slate-400/20 via-cyan-500/10 to-blue-500/20",
      corner: "border-slate-300",
    },
  },
  {
    id: "participant",
    label: "🎖️ Verified Participant",
    title: "CERTIFICATE OF PARTICIPATION",
    subtitle: "OFFICIAL HACKATHON ATTENDEE",
    recipient: "Rohan Varma",
    track: "Open Source Contributor • Cloud Native & DevOps",
    citation:
      "Awarded in appreciation of active participation, rigorous collaboration, and project submission during the 48-hour continuous coding hackathon.",
    certId: "NSOC26-PAR-042",
    theme: {
      border: "border-cyan-400/50 shadow-cyan-500/10",
      accent: "text-cyan-300",
      badgeBg: "bg-cyan-400/15 border-cyan-400/30 text-cyan-300",
      ribbonText: "★ VERIFIED OPEN SOURCE PARTICIPANT ★",
      glow: "from-cyan-500/20 via-emerald-500/10 to-indigo-500/20",
      corner: "border-cyan-400",
    },
  },
];

const faqs = [
  {
    q: "How do recruiters verify my NSOC certificate?",
    a: "Recruiters can either scan the QR code printed on your certificate or enter your unique Certificate ID (e.g. NSOC26-WIN-001) in the public verification terminal. It immediately pulls the immutable record with issue date, recipient name, and track verification.",
  },
  {
    q: "Can I add this certificate to my LinkedIn profile?",
    a: "Yes! On your certificate's verification page, click the 'Add to LinkedIn' button. It will open LinkedIn's official license & certification dialog with all fields pre-filled, including the permanent verification URL and issuing organization.",
  },
  {
    q: "Is there any cost for generating or verifying certificates?",
    a: "Zero cost (₹0 / $0). The platform is architected to be 100% free by utilizing client-side high-resolution rendering and Google Apps Script for automated transactional email delivery.",
  },
  {
    q: "Can I download a printable high-resolution PDF?",
    a: "Yes! On the certificate verification result page, simply click 'Print / Save as PDF'. The template includes dedicated print CSS rules that automatically format the certificate to landscape vector quality.",
  },
  {
    q: "What if a certificate ID is invalid or tempered with?",
    a: "The system cryptographically checks the certificate ID against the authorized registry. If a modified or non-existent ID is entered, the verification terminal displays a clear warning stating that the credential could not be authenticated.",
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState([
    { label: "Credentials Issued", value: 0 },
    { label: "Active Verifications", value: 0 },
    { label: "Enrolled Attendees", value: 0 },
    { label: "Live Events", value: 1 },
  ]);
  const [searchId, setSearchId] = useState("");
  const [activeTier, setActiveTier] = useState<"winner" | "runnerup" | "participant">("winner");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const [certs, parts] = await Promise.all([
          certificateService.getAll(),
          participantService.getAll(),
        ]);
        setStats([
          { label: "Credentials Issued", value: certs.length },
          { label: "Active Verifications", value: certs.filter((c) => c.status === "ACTIVE").length },
          { label: "Enrolled Attendees", value: parts.length },
          { label: "Live Events", value: 1 },
        ]);
      } catch (err) {
        console.error("Failed to load landing stats:", err);
      }
    }
    loadStats();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchId.trim().toUpperCase();
    if (clean) {
      navigate(`/verify/${encodeURIComponent(clean)}`);
    }
  };

  const selectedTierData = certificateTiers.find((t) => t.id === activeTier) || certificateTiers[0];

  return (
    <div className="overflow-hidden bg-background">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-grid overflow-hidden pt-12 pb-20">
        {/* Ambient background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[550px] w-[550px] rounded-full bg-primary/15 blur-[130px]" />
          <div className="absolute top-1/2 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-500/15 blur-[120px]" />
          <div className="absolute -bottom-20 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Pill Badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {eventConfig.fullName} • Official Credential Engine
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
            >
              Verify & Showcase{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                Open-Source Credentials
              </span>{" "}
              With Confidence.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Authoritative, instant, and tamper-evident certificate issuance platform.
              Secured with live QR authentication, automated delivery, and zero hosting cost.
            </motion.p>

            {/* Hero Quick Search Bar */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="pt-4 max-w-xl mx-auto"
            >
              <form
                onSubmit={handleHeroSearch}
                className="relative flex items-center rounded-2xl border border-border/80 bg-card/80 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
              >
                <Search className="ml-3 h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. NSOC26-WIN-001)..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!searchId.trim()}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Sample Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="text-[11px]">Quick Samples:</span>
                {["NSOC26-WIN-001", "NSOC26-RUN-002", "NSOC26-PAR-042"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setSearchId(chip);
                      navigate(`/verify/${chip}`);
                    }}
                    className="font-mono rounded-lg border border-border/70 bg-card/60 px-2 py-0.5 text-[11px] text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3 text-emerald-400" />
                Cryptographically validated against official event registry
              </p>
            </motion.div>

            {/* Quick Action Buttons */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.9 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all"
              >
                <Shield className="h-4 w-4" />
                Certificate Portal
              </Link>
              <Link
                to="/event"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-secondary/80 px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-all"
              >
                <Award className="h-4 w-4 text-primary" />
                Event Details & Tracks
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          METRICS & LIVE STATS
          ============================================ */}
      <section className="relative border-y border-border/60 bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-mono tracking-tight">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-2">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          INTERACTIVE 3D CERTIFICATE SHOWCASE
          ============================================ */}
      <section className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Executive Design Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2">
              Next-Generation Visual Credentials
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Crafted with 24K gold foil metallic gradients, custom typography, and permanent cryptographic QR codes. Click below to inspect each tier!
            </p>

            {/* Interactive Tier Switcher */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {certificateTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setActiveTier(tier.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeTier === tier.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                      : "bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            {/* Glow beneath the certificate */}
            <div
              className={`absolute -inset-4 bg-gradient-to-r ${selectedTierData.theme.glow} rounded-3xl blur-2xl opacity-70 -z-10 transition-all duration-500`}
            />

            {/* Certificate Preview Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTierData.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl border-2 ${selectedTierData.theme.border} bg-gradient-to-b from-[#111322] via-[#090b14] to-[#04060c] p-8 sm:p-12 shadow-2xl text-center text-slate-100 relative overflow-hidden`}
              >
                {/* Corner Ornamental Accents */}
                <div
                  className={`absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 ${selectedTierData.theme.corner}`}
                />
                <div
                  className={`absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 ${selectedTierData.theme.corner}`}
                />
                <div
                  className={`absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 ${selectedTierData.theme.corner}`}
                />
                <div
                  className={`absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 ${selectedTierData.theme.corner}`}
                />

                <div
                  className={`inline-block rounded-full border px-4 py-1 text-[11px] font-bold tracking-widest uppercase mb-4 ${selectedTierData.theme.badgeBg}`}
                >
                  {selectedTierData.theme.ribbonText}
                </div>

                <h3 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent">
                  {selectedTierData.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
                  {selectedTierData.subtitle} • {eventConfig.fullName} {eventConfig.year}
                </p>

                <div className="my-8">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                    PROUDLY PRESENTED TO
                  </p>
                  <div
                    className={`text-3xl sm:text-5xl font-serif font-black tracking-wide drop-shadow-md ${selectedTierData.theme.accent}`}
                  >
                    {selectedTierData.recipient}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-cyan-300">
                    {selectedTierData.track}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
                  {selectedTierData.citation}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-800 text-xs">
                  <div className="text-center sm:text-left">
                    <div className="font-serif font-bold text-slate-200 text-sm border-b border-slate-700 pb-1">
                      Dr. Aman Kumar, General Chair
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Authorized Issuing Authority
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-white p-1.5 shadow-md flex items-center justify-center">
                      <QrCode className="h-full w-full text-black" />
                    </div>
                    <div className="text-left font-mono text-[10px] text-amber-400">
                      <div>SECURED QR</div>
                      <div className="text-slate-400">ID: {selectedTierData.certId}</div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                      23 September 2026
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Date of Issuance</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES MATRIX
          ============================================ */}
      <section className="py-20 bg-muted/10 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Architectural Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2">
              Everything You Need for Enterprise-Grade Issuance
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Engineered from the ground up to provide seamless attendee verification and zero-friction credential management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 border`}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS (3-STEP PIPELINE)
          ============================================ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Simple 3-Step Verification
            </span>
            <h2 className="text-3xl font-extrabold text-foreground mt-2">
              How Authenticity Is Guaranteed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="rounded-2xl border border-border/60 bg-card p-6 relative text-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Issue & Mint</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Organizers upload event participant rosters. The engine mints a unique cryptographic identifier and signed QR code for each student.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 relative text-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Direct Dispatch</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Personalized emails are delivered with permanent verification anchors. Attendees can instantly view their credential on mobile or web.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 relative text-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Verify & Share</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Recruiters, universities, or companies enter the ID or scan the QR badge to view the official verified registry result in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          INTERACTIVE FAQ ACCORDION
          ============================================ */}
      <section className="py-20 bg-muted/20 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-foreground mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border/60 bg-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          BOTTOM VERIFICATION CTA
          ============================================ */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-indigo-500/10 to-purple-500/15 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Ready to Verify Your Credential?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-3">
              Enter your unique certificate identifier to confirm official event participation, track standings, and cryptographic authenticity.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02] transition-all"
              >
                <Search className="h-4 w-4" />
                Go to Verification Terminal
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-all"
              >
                Organizer Control Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
