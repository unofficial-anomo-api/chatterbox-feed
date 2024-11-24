import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "./ui/use-toast";

export const WelcomeModal = () => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<'auth' | 'username' | 'avatar'>('auth');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setStep('username');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUsernameSubmit = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setStep('avatar');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const handleAvatarSubmit = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setOpen(false);
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (step === 'auth') {
      setOpen(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Welcome to Anomours</DialogTitle>
          <DialogDescription className="mb-4">
            {step === 'auth' && "An Anomo clone created to give old users some nostalgia"}
            {step === 'username' && "Choose your username"}
            {step === 'avatar' && "Add a profile picture"}
          </DialogDescription>
        </DialogHeader>

        {step === 'auth' && (
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1EAEDB',
                    brandAccent: '#0FA0CE',
                  }
                }
              }
            }}
            theme="light"
            providers={[]}
            redirectTo={window.location.origin}
          />
        )}

        {step === 'username' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUsernameSubmit}
              disabled={!username.trim()}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'avatar' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{username[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Enter avatar URL"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setOpen(false);
                  navigate('/');
                }}
              >
                Skip
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleAvatarSubmit}
                disabled={!avatarUrl.trim()}
              >
                Finish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};