import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "./ui/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  is_anonymous: boolean;
  author_id: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const session = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          is_anonymous,
          created_at,
          author_id,
          profiles (
            username,
            avatar_url
          ),
          (
            SELECT count(*) FROM likes WHERE post_id = posts.id
          ) as likes_count,
          (
            SELECT count(*) FROM comments WHERE post_id = posts.id
          ) as comments_count
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedPosts = postsData.map((post) => ({
        id: post.id,
        author: {
          name: post.profiles?.username || "Anonymous",
          avatar: post.profiles?.avatar_url || "",
        },
        content: post.content,
        timestamp: new Date(post.created_at),
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        is_anonymous: post.is_anonymous,
        author_id: post.author_id,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    setChannel(channel);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost onPostCreated={fetchPosts} />
      
      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="commented">Commented</TabsTrigger>
        </TabsList>
        
        <TabsContent value="popular" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </TabsContent>
        
        <TabsContent value="following" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </TabsContent>
        
        <TabsContent value="commented" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feed;