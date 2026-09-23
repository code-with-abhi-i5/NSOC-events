import { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// ---- Lazy-loaded Pages ----
// Public
const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const VerifyPage = lazy(() => import("@/pages/public/VerifyPage"));
const VerifyResultPage = lazy(() => import("@/pages/public/VerifyResultPage"));
const EventPage = lazy(() => import("@/pages/public/EventPage"));

// Admin
const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const ParticipantsPage = lazy(() => import("@/pages/admin/ParticipantsPage"));
const CertificatesPage = lazy(() => import("@/pages/admin/CertificatesPage"));
const TemplatesPage = lazy(() => import("@/pages/admin/TemplatesPage"));
const EmailTemplatesPage = lazy(() => import("@/pages/admin/EmailTemplatesPage"));
const CampaignsPage = lazy(() => import("@/pages/admin/CampaignsPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const AuditLogsPage = lazy(() => import("@/pages/admin/AuditLogsPage"));

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
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/admin",
    Component: AdminGuard,
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
