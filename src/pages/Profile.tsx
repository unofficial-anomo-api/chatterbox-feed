import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Profile {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  last_username_change: string | null;
}

const Profile = () => {
  const session = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, bio, last_username_change")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setOriginalUsername(data.username);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canChangeUsername = (lastChange: string | null): boolean => {
    if (!lastChange) return true;
    const changeDate = new Date(lastChange);
    const cooldownEnds = new Date(changeDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date() >= cooldownEnds;
  };

  const getNextUsernameChangeDate = (lastChange: string): string => {
    const changeDate = new Date(lastChange);
    const nextChangeDate = new Date(changeDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextChangeDate.toLocaleDateString();
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !profile) return;

    // Check if username is being changed
    const isUsernameChange = profile.username !== originalUsername;
    
    // Validate username change cooldown
    if (isUsernameChange && profile.last_username_change && !canChangeUsername(profile.last_username_change)) {
      toast({
        title: "Error",
        description: `Username can only be changed once per week. Next change available after ${getNextUsernameChangeDate(profile.last_username_change)}`,
        variant: "destructive",
      });
      // Reset username to original
      setProfile(prev => prev ? { ...prev, username: originalUsername } : null);
      return;
    }

    setUpdating(true);
    try {
      const updates: { bio?: string; username?: string } = {
        bio: profile.bio
      };
      
      if (isUsernameChange) {
        updates.username = profile.username;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      if (updates.username) {
        setOriginalUsername(updates.username);
        await fetchProfile(); // Refresh to get the new last_username_change
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      // Reset username to original if there was an error
      setProfile(prev => prev ? { ...prev, username: originalUsername } : null);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>{profile?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={profile?.username || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, username: e.target.value } : null
                    )
                  }
                />
                {profile?.last_username_change && profile.username !== originalUsername && (
                  <p className="text-sm text-muted-foreground">
                    Next username change available after: {getNextUsernameChangeDate(profile.last_username_change)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={profile?.bio || ""}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev ? { ...prev, bio: e.target.value } : null
                    )
                  }
                />
              </div>

              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;