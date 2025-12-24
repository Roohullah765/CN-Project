import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Auth from "./pages/Auth";
import Pending from "./pages/Pending";
import Inbox from "./pages/Inbox";
import Sent from "./pages/Sent";
import Starred from "./pages/Starred";
import Drafts from "./pages/Drafts";
import Trash from "./pages/Trash";
import Compose from "./pages/Compose";
import MessageView from "./pages/MessageView";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isApproved, profile } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.status === 'pending') return <Navigate to="/pending" replace />;
  if (profile?.status === 'rejected') return <Navigate to="/pending" replace />;
  if (profile?.status === 'suspended') return <Navigate to="/pending" replace />;
  if (!isApproved) return <Navigate to="/pending" replace />;
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/inbox" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/pending" element={<Pending />} />
              <Route path="/" element={<Navigate to="/inbox" replace />} />
              <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
              <Route path="/sent" element={<ProtectedRoute><Sent /></ProtectedRoute>} />
              <Route path="/starred" element={<ProtectedRoute><Starred /></ProtectedRoute>} />
              <Route path="/drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />
              <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
              <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
              <Route path="/message/:id" element={<ProtectedRoute><MessageView /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<Navigate to="/profile" replace />} />
              <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
