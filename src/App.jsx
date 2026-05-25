import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext.jsx";
import { SettingsProvider } from "@/contexts/SettingsContext.jsx";
import AppLayout from "@/components/layout/Layout.jsx";
import HomePage from "@/pages/HomePage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import SignUpPage from "@/pages/SignUpPage.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";
import UploadPage from "@/pages/UploadPage.jsx";
import ArchivePage from "@/pages/ArchivePage.jsx";
import ApprovalPendingPage from "@/pages/ApprovalPendingPage.jsx";
import ApprovalApprovedPage from "@/pages/ApprovalApprovedPage.jsx";
import RoleManagementPage from "@/pages/RoleManagementPage.jsx";
import UserManagementPage from "@/pages/UserManagementPage.jsx";
import LogPage from "@/pages/LogPage.jsx";
import SettingsPage from "@/pages/SettingsPage.jsx";
import VerifyPage from "@/pages/VerifyPage.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import ChangePasswordPage from "@/pages/ChangePasswordPage.jsx";
import HomeDashboardPage from "@/pages/HomeDashboardPage.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn } = useApp();
  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <HomePage />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
      <Route path="/verify-document/:id" element={<VerifyPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/home" element={<HomeDashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/approval" element={<Navigate to="/approval/pending" replace />} />
        <Route path="/approval/pending" element={<ApprovalPendingPage />} />
        <Route path="/approval/approved" element={<ApprovalApprovedPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/roles" element={<RoleManagementPage />} />
        <Route path="/logs" element={<LogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppWithSettings() {
  return (
    <SettingsProvider>
      <AppRoutes />
    </SettingsProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppWithSettings />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
