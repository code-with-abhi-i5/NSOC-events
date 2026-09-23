import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Award,
  Globe,
  Mail,
  ExternalLink,
  Shield,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  Code2,
  Cpu,
  Terminal,
  Zap,
  ChevronRight,
  Search,
} from "lucide-react";
import { eventConfig } from "@/config/eventConfig";

const tracks = [
  {
    id: "ai",
    icon: Cpu,
    title: "AI & Autonomous Agent Systems",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    badge: "Flagship Track",
    prize: "₹50,000 + Winner Trophy",
    certTier: "Gold Foil Credential",
    description:
      "Design intelligent agents, context-aware reasoning engines, local LLM tooling, and Model Context Protocol (MCP) integrations that solve real-world workflows.",
    tags: ["LLMs", "Autonomous Agents", "MCP", "LangChain", "Vector DBs"],
  },
  {
    id: "web3",
    icon: Shield,
    title: "Web3 & Cryptographic Primitives",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    badge: "Security Focus",
    prize: "₹40,000 + Silver Plaque",
    certTier: "Platinum Credential",
    description:
      "Build zero-knowledge proofs, verifiable credential ledgers, sovereign identity frameworks, and decentralized protocols with tamper-evident proof guarantees.",
    tags: ["ZK-Rollups", "Cryptography", "Decentralized ID", "Solidity", "Rust"],
  },
  {
    id: "cloud",
    icon: Zap,
    title: "Cloud Native & Edge Infrastructure",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    badge: "DevOps Excellence",
    prize: "₹35,000 + Cloud Credits",
    certTier: "Silver Credential",
    description:
      "Craft resilient distributed systems, sub-millisecond edge APIs, sovereign databases, and automated GitOps deployment pipelines.",
    tags: ["Kubernetes", "Docker", "Edge Runtime", "Go", "Observability"],
  },
  {
    id: "devex",
    icon: Terminal,
    title: "Open-Source Tooling & DevEx",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    badge: "Community Choice",
    prize: "₹25,000 + Swag Kits",
    certTier: "Bronze Credential",
    description:
      "Empower fellow engineers with high-velocity developer tools, supercharged CLIs, browser extensions, and open documentation engines.",
    tags: ["CLI Tools", "TypeScript", "Vite", "Developer Experience"],
  },
];

const scheduleDays = [
  {
    dayNumber: "Day 1",
    date: "15 Jan 2026",
    title: "Kickoff, Keynotes & Team Assembly",
    agenda: [
      {
        time: "09:00 AM - 10:30 AM",
        title: "Grand Opening Ceremony & Keynote Address",
        speaker: "Dr. Aman Kumar & Core Committee",
        type: "Keynote",
      },
      {
        time: "10:30 AM - 11:30 AM",
        title: "Track Briefing & Problem Statement Reveal",
        speaker: "Track Leads & Mentors",
        type: "Briefing",
      },
      {
        time: "12:00 PM",
        title: "Hacking Commences (48-Hour Timer Begins)",
        speaker: "All Participants",
        type: "Hackathon",
      },
      {
        time: "04:00 PM - 06:00 PM",
        title: "Technical Architecture Checkpoint 1",
        speaker: "Senior Mentors",
        type: "Mentorship",
      },
    ],
  },
  {
    dayNumber: "Day 2",
    date: "16 Jan 2026",
    title: "Code Sprint, Workshops & Mid-Review",
    agenda: [
      {
        time: "10:00 AM - 11:30 AM",
        title: "Masterclass: Enterprise Cryptographic Credentialing",
        speaker: "Abhijeet Ghosh, System Architect",
        type: "Workshop",
      },
      {
        time: "02:00 PM - 05:00 PM",
        title: "Mid-Term Review & Code Quality Check",
        speaker: "Jury Panel",
        type: "Evaluation",
      },
      {
        time: "09:00 PM - 11:00 PM",
        title: "Late Night Gaming & Community Social Sprint",
        speaker: "Student Volunteers",
        type: "Community",
      },
    ],
  },
  {
    dayNumber: "Day 3",
    date: "17 Jan 2026",
    title: "Project Demos, Judging & Grand Awards",
    agenda: [
      {
        time: "12:00 PM",
        title: "Hacking Officially Concludes (Code Freeze)",
        speaker: "System Automatic",
        type: "Deadline",
      },
      {
        time: "01:00 PM - 04:30 PM",
        title: "Live Project Demos & Jury Q&A",
        speaker: "Top 20 Finalist Teams",
        type: "Presentation",
      },
      {
        time: "05:30 PM - 07:00 PM",
        title: "Closing Ceremony & Instant Certificate Minting",
        speaker: "Dignitaries & Organizing Team",
        type: "Awards Gala",
      },
    ],
  },
];

const judgingCriteria = [
  {
    weight: "30%",
    title: "Technical Complexity & Rigor",
    desc: "Architecture depth, clean code standards, error resilience, and engineering challenge overcome.",
  },
  {
    weight: "30%",
    title: "Open-Source Impact & Reusability",
    desc: "Documentation clarity, permissive licensing, modularity, and potential for community adoption.",
  },
  {
    weight: "25%",
    title: "Innovation & Originality",
    desc: "Novel approach to modern problems, creative UX paradigm, and differentiated utility.",
  },
  {
    weight: "15%",
    title: "Demo & Pitch Quality",
    desc: "Clarity of functional demonstration, roadmap vision, and responsiveness during live jury Q&A.",
  },
];

export default function EventPage() {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative py-24 bg-grid border-b border-border/60 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-1/2 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Annual Open-Source Summit & Hackathon {eventConfig.year}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Building the Future of{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Open-Source Software
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {eventConfig.description} An intensive 48-hour collaborative summit uniting visionary developers, architects, and designers to solve high-impact challenges with verifiable credentials.
            </p>

            {/* Fast Action CTA */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] transition-all"
              >
                <Search className="h-4 w-4" />
                Verify Your Certificate
              </Link>
              <a
                href="#tracks"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all"
              >
                <Code2 className="h-4 w-4 text-primary" />
                Explore Tracks & Prizes
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          KEY METRICS STRIP
          ============================================ */}
      <section className="border-b border-border/60 bg-muted/20 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                48 hrs
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Non-stop Hackathon
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                500+
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Developers & Builders
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                ₹1,50,000+
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Prizes & Bounty Pool
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                100%
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Cryptographic Credentials
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          INNOVATION TRACKS & PRIZE MATRIX
          ============================================ */}
      <section id="tracks" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Competition Domains
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2">
              Event Tracks & Sovereign Bounties
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Compete across four specialized verticals. Every participant is awarded an immutable verified credential upon successful evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group rounded-3xl border border-border/70 bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center border`}
                    >
                      <track.icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {track.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {track.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                    {track.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {track.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-muted-foreground font-medium">Bounty Award</div>
                    <div className="font-bold text-emerald-400 font-mono text-sm">
                      {track.prize}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground font-medium">Credential Tier</div>
                    <div className="font-semibold text-foreground flex items-center gap-1 justify-end">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      {track.certTier}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          INTERACTIVE 3-DAY AGENDA
          ============================================ */}
      <section className="py-24 bg-muted/15 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Summit Program
            </span>
            <h2 className="text-3xl font-extrabold text-foreground mt-2">
              Official Schedule & Timeline
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              All times are calibrated to Indian Standard Time (IST). Live broadcasts available for virtual attendees.
            </p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex justify-center gap-3 mb-10">
            {scheduleDays.map((d, index) => (
              <button
                key={d.dayNumber}
                onClick={() => setSelectedDay(index)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                  selectedDay === index
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card text-muted-foreground border-border/70 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <div className="font-mono text-xs opacity-80">{d.dayNumber}</div>
                <div>{d.date}</div>
              </button>
            ))}
          </div>

          {/* Active Day Agenda Cards */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold text-foreground">
                {scheduleDays[selectedDay].title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Day {selectedDay + 1} Program Schedule • {scheduleDays[selectedDay].date}
              </p>
            </div>

            <div className="space-y-4">
              {scheduleDays[selectedDay].agenda.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-background/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md font-semibold">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-foreground pt-1">
                      {item.title}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                    <span className="font-medium text-foreground">{item.speaker}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          JUDGING & EVALUATION CRITERIA
          ============================================ */}
      <section className="py-24 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Transparent Evaluation
            </span>
            <h2 className="text-3xl font-extrabold text-foreground mt-2">
              Jury Scoring Criteria
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              All submissions are peer-reviewed and vetted across four standardized metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {judgingCriteria.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="text-3xl font-mono font-black text-primary mb-2">
                  {c.weight}
                </div>
                <h4 className="text-sm font-bold text-foreground">{c.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          ORGANIZERS & CONTACT SECTION
          ============================================ */}
      <section className="py-20 bg-muted/20 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/70 bg-card p-8 sm:p-12 shadow-sm text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 text-primary">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Questions or Partnership Inquiries?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Reach out to the {eventConfig.name} Organizing Committee. We are happy to assist with participant queries, sponsorship, and verification questions.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`mailto:${eventConfig.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
              >
                <Mail className="h-4 w-4" />
                {eventConfig.contactEmail}
              </a>
              {eventConfig.website && (
                <a
                  href={eventConfig.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-6 py-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/50 transition-all"
                >
                  <Globe className="h-4 w-4" />
                  Official Website
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
