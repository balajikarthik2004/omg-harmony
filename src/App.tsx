import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TierProvider } from "@/contexts/TierContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DevoteesPage from "@/pages/DevoteesPage";
import MembershipPage from "@/pages/MembershipPage";
import PoojaSevaPage from "@/pages/PoojaSevaPage";
import DonationsPage from "@/pages/DonationsPage";
import EventsPage from "@/pages/EventsPage";
import CampaignPage from "@/pages/CampaignPage";
import TasksPage from "@/pages/TasksPage";
import InventoryPage from "@/pages/InventoryPage";
import AssetsPage from "@/pages/AssetsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import DonatePage from "@/pages/DonatePage";
import NotFound from "@/pages/NotFound";
import HrPage from "@/pages/HrPage";
import ProcurementPage from "@/pages/ProcurementPage";
import AnnadhanamPage from "@/pages/AnnadhanamPage";
import ParkingPage from "@/pages/ParkingPage";
import VolunteerPage from "@/pages/VolunteerPage";
import HallBookingPage from "@/pages/HallBookingPage";
import ThemeStudioPage from "@/pages/ThemeStudioPage";
import TierEntryPage from "@/pages/TierEntryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TierProvider>
        <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/foundation" element={<TierEntryPage tier="foundation" />} />
              <Route path="/growth" element={<TierEntryPage tier="growth" />} />
              <Route path="/enterprise" element={<TierEntryPage tier="enterprise" />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="admin"><DashboardPage /></ProtectedRoute>} />
                <Route path="/devotees" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="devotees"><DevoteesPage /></ProtectedRoute>} />
                <Route path="/membership" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="membership"><MembershipPage /></ProtectedRoute>} />
                <Route path="/pooja-seva" element={<ProtectedRoute module="pooja"><PoojaSevaPage /></ProtectedRoute>} />
                <Route path="/annadhanam" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="annadhanam"><AnnadhanamPage /></ProtectedRoute>} />
                <Route path="/services" element={<Navigate to="/pooja-seva" replace />} />
                <Route path="/bookings" element={<Navigate to="/pooja-seva" replace />} />
                <Route path="/donations" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="donation"><DonationsPage /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute module="events"><EventsPage /></ProtectedRoute>} />
                <Route path="/campaign" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="campaigns"><CampaignPage /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="tasks"><TasksPage /></ProtectedRoute>} />
                <Route path="/procurement" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="inventory"><ProcurementPage /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="inventory"><InventoryPage /></ProtectedRoute>} />
                <Route path="/assets" element={<ProtectedRoute allowedRoles={['admin']} module="asset"><AssetsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']} module="documents"><ReportsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']} module="admin"><SettingsPage /></ProtectedRoute>} />
                <Route path="/theme-studio" element={<ProtectedRoute module="admin"><ThemeStudioPage /></ProtectedRoute>} />
                <Route path="/hr" element={<ProtectedRoute allowedRoles={['admin']} module="hr"><HrPage /></ProtectedRoute>} />
                <Route path="/parking" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="parking"><ParkingPage /></ProtectedRoute>} />
                <Route path="/volunteers" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="hr"><VolunteerPage /></ProtectedRoute>} />
                <Route path="/hall-booking" element={<ProtectedRoute allowedRoles={['admin', 'manager']} module="venue"><HallBookingPage /></ProtectedRoute>} />
                <Route path="/donate" element={<ProtectedRoute module="donation"><DonatePage /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
      </TierProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
