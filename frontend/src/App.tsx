import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReviewNews from "./pages/AdminReviewNews";
import AdminArticles from "./pages/AdminArticles";
import AdminSettings from "./pages/AdminSettings";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000/";
// axios.defaults.baseURL="https://2l2nbddc-3000.asse.devtunnels.ms";



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
  },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              {/* <Route path="dashboard" element={<ProtectedRoute><AdminDashboard /> </ProtectedRoute>} /> */}
              {/* <Route path="review" element={<ProtectedRoute><AdminReviewNews /></ProtectedRoute>} /> */}
              <Route path="articles" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
              {/* <Route path="users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} /> */}
              {/* <Route path="settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} /> */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
