import { useState, useEffect } from "react";
import { Menu, X, Bell, Search, User, Newspaper, LogOut, Download } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="mr-4"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">Anomours</h1>
      </header>

      {/* Side Menu */}
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
            <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
              <User className="h-6 w-6" />
              <span>Profile</span>
            </div>
            <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
              <Search className="h-6 w-6" />
              <span>Search</span>
            </div>
            <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
              <Bell className="h-6 w-6" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
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
            <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
              <LogOut className="h-6 w-6" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 pb-16 min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;