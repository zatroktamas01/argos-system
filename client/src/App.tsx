import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";

import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import AdminPage from "./pages/AdminPage";
import TestCenterPage from "./pages/TestCenterPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AuditLogPage from "./pages/AuditLogPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/tickets"
            element={<TicketsPage />}
          />

          <Route
            path="/tickets/:id"
            element={<TicketDetailsPage />}
          />

          <Route
            path="/ai"
            element={<AIAssistantPage />}
          />

          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />

          <Route
            path="/audit-logs"
            element={<AuditLogPage />}
          />

          <Route
            path="/tickets/new"
            element={<CreateTicketPage />}
          />

          <Route
            path="/admin"
            element={<AdminPage />}
          />

          <Route
            path="/test-center"
            element={<TestCenterPage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          <Route
            path="/knowledge"
            element={<KnowledgeBasePage />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;