import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import News from "./pages/News";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <SessionContextProvider supabaseClient={supabase}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/news" element={<News />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SessionContextProvider>
);

export default App;