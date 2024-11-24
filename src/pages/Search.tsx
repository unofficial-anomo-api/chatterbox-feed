import { useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .ilike("username", `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: searchTerm.length > 0,
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6"
        />

        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {profiles?.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="flex items-center space-x-4 p-4">
                <Avatar>
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{profile.username}</h3>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {searchTerm && profiles?.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground">No users found</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;