import { useState, useEffect } from "react";
import { Menu, X, Bell, Search, User, Newspaper, LogOut, Download } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DailyPrompt from "./DailyPrompt";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();
  const { handleLogout, user } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications count
  const { data: notificationsCount = 0 } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!user,
  });

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: "App installed successfully!",
          description: "You can now access Anomours from your home screen.",
        });
      }
      setDeferredPrompt(null);
    } else {
      toast({
        title: "Installation not available",
        description: "The app is either already installed or your browser doesn't support PWA installation.",
        variant: "destructive",
      });
    }
  };

  const handleMenuClick = (route: string) => {
    navigate(route);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border z-50">
        <div className="h-16 flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="mr-4"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Anomours</h1>
        </div>
        <DailyPrompt />
      </header>

      {/* Sidebar menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-primary">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex flex-col space-y-6">
            <div 
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => handleMenuClick('/profile')}
            >
              <User className="h-6 w-6" />
              <span>Profile</span>
            </div>
            <div 
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => handleMenuClick('/search')}
            >
              <Search className="h-6 w-6" />
              <span>Search</span>
            </div>
            <div 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => handleMenuClick('/notifications')}
            >
              <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6" />
                <span>Notifications</span>
              </div>
              {notificationsCount > 0 && (
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                  {notificationsCount}
                </span>
              )}
            </div>
            <div 
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => handleMenuClick('/news')}
            >
              <Newspaper className="h-6 w-6" />
              <span>News</span>
            </div>
            <div 
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={handleInstall}
            >
              <Download className="h-6 w-6" />
              <span>Install App</span>
            </div>
            <div 
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-6 w-6" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-28 pb-16 min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;