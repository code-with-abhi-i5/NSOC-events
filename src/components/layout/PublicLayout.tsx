import { Link, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Menu,
  X,
  Shield,
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { eventConfig } from "@/config/eventConfig";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Verify Certificate", href: "/verify", highlight: true },
  { label: "Event & Tracks", href: "/event" },
];

export default function PublicLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Announcement Bar */}
      <div className="relative z-50 bg-gradient-to-r from-primary/90 via-indigo-600/90 to-purple-600/90 py-1.5 px-4 text-xs font-medium text-white shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            <span className="font-semibold tracking-wide">
              {eventConfig.fullName} {eventConfig.year}
            </span>
            <span className="hidden sm:inline text-white/80">•</span>
            <span className="hidden sm:inline text-white/90 truncate">
              Official Public Credential Ledger & Verification Portal
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/verify"
              className="inline-flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white transition-colors"
            >
              <Search className="h-3 w-3" />
              Verify ID
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-violet-500 text-white shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/40">
              <Award className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-primary to-purple-500 opacity-0 group-hover:opacity-40 blur transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-foreground leading-none">
                  {eventConfig.name}
                </span>
                <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary tracking-wider uppercase">
                  {eventConfig.year}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground leading-none mt-1">
                {eventConfig.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    link.highlight && !isActive && "text-foreground font-semibold"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {link.highlight && <Shield className="h-3.5 w-3.5 text-primary" />}
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="ml-3 h-5 w-px bg-border/60" />

            {/* Network Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-medium ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Ledger Live</span>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl border border-border/60 hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-2"
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/10 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {link.highlight && <Shield className="h-4 w-4 text-primary" />}
                      {link.label}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                );
              })}

            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Next-Level Architectural Footer */}
      <footer className="border-t border-border/60 bg-card/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Col 1 & 2: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight text-foreground">
                    {eventConfig.fullName} {eventConfig.year}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Autonomous Credential & Event Platform
                  </div>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                Empowering developers, students, and open-source contributors with cryptographically signed, tamper-evident digital credentials. Instant QR verification and 1-click professional showcases.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Public Ledger Operational</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground font-mono">
                  <span>SHA-256 Validated</span>
                </div>
              </div>
            </div>

            {/* Col 3: Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Public Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Home Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/verify"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Shield className="h-3 w-3 text-primary" />
                    Verify Certificate
                  </Link>
                </li>
                <li>
                  <Link
                    to="/event"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="h-3 w-3" />
                    Event Agenda & Tracks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform Pillars */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Security & Tech
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Instant QR Code Scan</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>LinkedIn 1-Click Sync</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>Vector PDF Printing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Zero-Cost Ecosystem</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Connect & Community */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Connect
              </h4>
              <p className="text-xs text-muted-foreground">
                Have questions regarding your certificate or need event assistance?
              </p>
              <a
                href={`mailto:${eventConfig.contactEmail}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline break-all"
              >
                {eventConfig.contactEmail}
              </a>

              {/* Social Link Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {/* GitHub */}
                {eventConfig.socialLinks.github && (
                  <a
                    href={eventConfig.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    title="GitHub"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                )}
                {/* LinkedIn */}
                {eventConfig.socialLinks.linkedin && (
                  <a
                    href={eventConfig.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                    </svg>
                  </a>
                )}
                {/* Twitter / X */}
                {eventConfig.socialLinks.twitter && (
                  <a
                    href={eventConfig.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-border/80 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    title="X / Twitter"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>{eventConfig.footerText}</div>
            <div className="flex items-center gap-6">
              <span className="hover:text-foreground transition-colors cursor-default">
                Cryptographic Sovereign Registry
              </span>
              <span>•</span>
              <span className="hover:text-foreground transition-colors cursor-default">
                Zero Cloud Storage Dependency
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
