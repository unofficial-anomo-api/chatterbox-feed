import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2, Heart, MessageSquare, UserPlus, AtSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: 'like_post' | 'like_comment' | 'follow' | 'mention' | 'comment';
  content: string;
  created_at: string;
  is_read: boolean;
  reference_id: string;
  notification_group_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'like_post':
    case 'like_comment':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'mention':
      return <AtSign className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const Notifications = () => {
  const session = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          profiles:profiles!notifications_reference_id_fkey(username, avatar_url)
        `)
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

    // Set up realtime subscription
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session?.user?.id}`,
        },
        (payload) => {
          // Refresh notifications
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
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

  const filterNotifications = (type: string) => {
    if (!notifications) return [];
    
    switch (type) {
      case "unread":
        return notifications.filter(n => !n.is_read);
      case "likes":
        return notifications.filter(n => n.type.startsWith('like_'));
      case "comments":
        return notifications.filter(n => n.type === 'comment');
      case "follows":
        return notifications.filter(n => n.type === 'follow');
      case "mentions":
        return notifications.filter(n => n.type === 'mention');
      default:
        return notifications;
    }
  };

  const groupNotifications = (notifications: Notification[]) => {
    const groups = new Map();
    
    notifications.forEach(notification => {
      const key = notification.notification_group_id || notification.id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(notification);
    });

    return Array.from(groups.values());
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="follows">Follows</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>

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
              {groupNotifications(filterNotifications(activeTab)).map((group, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    {group.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-4 py-2 ${
                          !notification.is_read ? "bg-muted/20" : ""
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {notification.profiles?.username}
                            </span>
                            <span className="text-muted-foreground">
                              {notification.content}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Notifications;