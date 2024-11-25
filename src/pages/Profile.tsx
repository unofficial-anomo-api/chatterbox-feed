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

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !profile) return;

    setUpdating(true);
    try {
      // Only include username in the update if it has changed
      const updates: { bio?: string; username?: string } = {
        bio: profile.bio
      };
      
      if (profile.username !== originalUsername) {
        updates.username = profile.username;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        if (error.message.includes("Username can only be changed once per week")) {
          const lastChange = new Date(profile.last_username_change || "");
          const nextChangeDate = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
          throw new Error(`Username can only be changed once per week. You can change it again after ${nextChangeDate.toLocaleDateString()}`);
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Update the original username if the update was successful
      if (updates.username) {
        setOriginalUsername(updates.username);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      // Revert username to original if there was an error
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