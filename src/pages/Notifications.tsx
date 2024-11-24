import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  type: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const Notifications = () => {
  const session = useSession();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (session?.user) {
      markNotificationsAsRead();
    }
  }, [session]);

  const markNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session?.user?.id)
        .eq("is_read", false);

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <p>{notification.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;