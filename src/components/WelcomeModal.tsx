import { useState } from "react";
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
  const [step, setStep] = useState<'auth' | 'avatar'>('auth');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });
      
      if (error) throw error;
      setStep('avatar');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
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
    <Dialog open={open} onOpenChange={handleClose} modal>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Welcome to Anomours</DialogTitle>
          <DialogDescription className="mb-4">
            {step === 'auth' && "An Anomo clone created to give old users some nostalgia"}
            {step === 'avatar' && "Add a profile picture"}
          </DialogDescription>
        </DialogHeader>

        {step === 'auth' && (
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
              onSubmit={async (formData) => {
                if (formData.type === 'signup') {
                  await handleSignUp(formData.email, formData.password);
                }
              }}
            />
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