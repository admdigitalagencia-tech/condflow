import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Condominios from "./pages/Condominios";
import CondominioDetail from "./pages/CondominioDetail";
import Ocorrencias from "./pages/Ocorrencias";
import Assembleias from "./pages/Assembleias";
import Documentos from "./pages/Documentos";
import Stakeholders from "./pages/Stakeholders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/condominios" element={<Condominios />} />
            <Route path="/condominios/:id" element={<CondominioDetail />} />
            <Route path="/ocorrencias" element={<Ocorrencias />} />
            <Route path="/assembleias" element={<Assembleias />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/stakeholders" element={<Stakeholders />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
