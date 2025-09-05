import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Partnership from "./pages/Partnership";
import PartnerSignup from "./pages/PartnerSignup";
import PartnerDashboard from "./pages/PartnerDashboard";
import NotFound from "./pages/NotFound";
import PartnerLogin from "./pages/PartnerLogin";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Partnership />} />
          <Route path="/parceria" element={<Partnership />} />
          <Route path="/parceria/cadastro" element={<PartnerSignup />} />
          <Route path="/parceria/login" element={<PartnerLogin />} />
          <Route path="/parceria/admin" element={<AdminPanel />} />
          <Route path="/parceria/painel" element={<PartnerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;