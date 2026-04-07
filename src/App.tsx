import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DevoteesPage from "@/pages/DevoteesPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DashboardPage /></ProtectedRoute>} />
                <Route path="/devotees" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DevoteesPage /></ProtectedRoute>} />
                <Route path="/pooja-seva" element={<PoojaSevaPage />} />
                <Route path="/annadhanam" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AnnadhanamPage /></ProtectedRoute>} />
                <Route path="/services" element={<Navigate to="/pooja-seva" replace />} />
                <Route path="/bookings" element={<Navigate to="/pooja-seva" replace />} />
                <Route path="/donations" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DonationsPage /></ProtectedRoute>} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/campaign" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CampaignPage /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><TasksPage /></ProtectedRoute>} />
                <Route path="/procurement" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ProcurementPage /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><InventoryPage /></ProtectedRoute>} />
                <Route path="/assets" element={<ProtectedRoute allowedRoles={['admin']}><AssetsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
                <Route path="/theme-studio" element={<ThemeStudioPage />} />
                <Route path="/hr" element={<ProtectedRoute allowedRoles={['admin']}><HrPage /></ProtectedRoute>} />
                <Route path="/parking" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ParkingPage /></ProtectedRoute>} />
                <Route path="/volunteers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VolunteerPage /></ProtectedRoute>} />
                <Route path="/hall-booking" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><HallBookingPage /></ProtectedRoute>} />
                <Route path="/donate" element={<DonatePage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
