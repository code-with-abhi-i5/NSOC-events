import { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// ---- Resilient Dynamic Import with Auto-Recovery on Deployments ----
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const module = await factory();
      window.sessionStorage.removeItem("nsoc_chunk_refreshed");
      return module;
    } catch (error) {
      const refreshed = window.sessionStorage.getItem("nsoc_chunk_refreshed");
      if (!refreshed) {
        window.sessionStorage.setItem("nsoc_chunk_refreshed", "true");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      window.sessionStorage.removeItem("nsoc_chunk_refreshed");
      throw error;
    }
  });
}

function RouteErrorBoundary() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="rounded-3xl border border-border/80 bg-card p-8 max-w-md shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary text-xl font-bold">
          ⚡
        </div>
        <h2 className="text-xl font-bold text-foreground">Platform Updated</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A new version has been deployed. Please refresh the page to load the latest interface.
        </p>
        <button
          onClick={() => {
            window.sessionStorage.clear();
            window.location.reload();
          }}
          className="w-full rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
        >
          Reload Latest Version
        </button>
      </div>
    </div>
  );
}

// ---- Lazy-loaded Pages with Auto-Retry ----
// Public
const LandingPage = lazyWithRetry(() => import("@/pages/public/LandingPage"));
const VerifyPage = lazyWithRetry(() => import("@/pages/public/VerifyPage"));
const VerifyResultPage = lazyWithRetry(() => import("@/pages/public/VerifyResultPage"));
const EventPage = lazyWithRetry(() => import("@/pages/public/EventPage"));

// Admin
const LoginPage = lazyWithRetry(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazyWithRetry(() => import("@/pages/admin/DashboardPage"));
const ParticipantsPage = lazyWithRetry(() => import("@/pages/admin/ParticipantsPage"));
const CertificatesPage = lazyWithRetry(() => import("@/pages/admin/CertificatesPage"));
const TemplatesPage = lazyWithRetry(() => import("@/pages/admin/TemplatesPage"));
const EmailTemplatesPage = lazyWithRetry(() => import("@/pages/admin/EmailTemplatesPage"));
const CampaignsPage = lazyWithRetry(() => import("@/pages/admin/CampaignsPage"));
const AnalyticsPage = lazyWithRetry(() => import("@/pages/admin/AnalyticsPage"));
const SettingsPage = lazyWithRetry(() => import("@/pages/admin/SettingsPage"));
const UsersPage = lazyWithRetry(() => import("@/pages/admin/UsersPage"));
const AuditLogsPage = lazyWithRetry(() => import("@/pages/admin/AuditLogsPage"));

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { PageLoader } from "@/components/ui/PageLoader";
import NotFoundPage from "@/pages/NotFoundPage";

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function AdminGuard() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  // ---- Public Routes ----
  {
    Component: PublicLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: (
          <SuspenseWrapper>
            <LandingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/verify",
        element: (
          <SuspenseWrapper>
            <VerifyPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/verify/:certificateId",
        element: (
          <SuspenseWrapper>
            <VerifyResultPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/event",
        element: (
          <SuspenseWrapper>
            <EventPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // ---- Admin Routes ----
  {
    path: "/admin/login",
    errorElement: <RouteErrorBoundary />,
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/admin",
    Component: AdminGuard,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "participants",
        element: (
          <SuspenseWrapper>
            <ParticipantsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "certificates",
        element: (
          <SuspenseWrapper>
            <CertificatesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "templates",
        element: (
          <SuspenseWrapper>
            <TemplatesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "email-templates",
        element: (
          <SuspenseWrapper>
            <EmailTemplatesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "campaigns",
        element: (
          <SuspenseWrapper>
            <CampaignsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "analytics",
        element: (
          <SuspenseWrapper>
            <AnalyticsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <SuspenseWrapper>
            <UsersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <SuspenseWrapper>
            <AuditLogsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // ---- 404 ----
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
