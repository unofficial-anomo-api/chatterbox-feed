import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Bell, Search, Newspaper, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import DailyPrompt from "./DailyPrompt";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { handleLogout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-[#1EAEDB] text-white">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Anomours
              </span>
            </Link>
          </div>
          <nav className={`${
            isMenuOpen
              ? "absolute left-0 top-14 z-50 w-full border-b bg-[#1EAEDB] pb-4 pt-2 md:static md:w-auto md:border-none md:bg-transparent md:pb-0 md:pt-0"
              : "hidden md:flex"
          } flex-1`}>
            <div className="container flex flex-1 items-center space-x-2 md:justify-end">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Feed
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link to="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link to="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link to="/news">
                  <Newspaper className="mr-2 h-4 w-4" />
                  News
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setIsMenuOpen(false)}
                asChild
              >
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </Button>
            </div>
          </nav>
          {isMenuOpen && (
            <Button
              variant="ghost"
              className="absolute right-4 top-3 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
      </header>

      {location.pathname === "/" && <DailyPrompt />}
      
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;