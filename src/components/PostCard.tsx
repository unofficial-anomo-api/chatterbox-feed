import { useState, useEffect } from "react";
import { Heart, MoreVertical, MessageSquare, EyeOff, Bell, BellOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

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

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  useEffect(() => {
    checkIfLiked();
    checkIfSubscribed();
  }, [post.id, session?.user?.id]);

  const checkIfLiked = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", session.user.id)
      .single();

    setLiked(!!data);
  };

  const checkIfSubscribed = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", session.user.id)
      .single();

    setIsSubscribed(!!data);
  };

  const handleLike = async () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", session.user.id);
      } else {
        await supabase
          .from("likes")
          .insert({
            post_id: post.id,
            user_id: session.user.id,
          });
      }

      setLiked(!liked);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe to posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSubscribed) {
        await supabase
          .from("subscriptions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", session.user.id);
      } else {
        await supabase
          .from("subscriptions")
          .insert({
            post_id: post.id,
            user_id: session.user.id,
          });
      }

      setIsSubscribed(!isSubscribed);
      toast({
        title: isSubscribed ? "Unsubscribed" : "Subscribed",
        description: isSubscribed 
          ? "You will no longer receive notifications for this post" 
          : "You will receive notifications for new comments on this post",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("author_id", session?.user?.id);

      onUpdate();
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const isOwnPost = session?.user?.id === post.author_id;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {post.is_anonymous ? (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold">
              {post.is_anonymous ? "Anonymous" : post.author.name}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(post.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Share</DropdownMenuItem>
            {!isOwnPost && (
              <>
                <DropdownMenuItem onClick={handleSubscribe}>
                  {isSubscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Unsubscribe
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>Follow User</DropdownMenuItem>
                <DropdownMenuItem>Mute User</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Chat</DropdownMenuItem>
              </>
            )}
            {isOwnPost && (
              <>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-gray-800">{post.content}</p>

      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={liked ? "text-red-500" : ""}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
          </Button>
          <span className="text-sm text-gray-500">{post.likes}</span>
        </div>

        <Button variant="ghost" className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm text-gray-500">{post.comments}</span>
        </Button>
      </div>
    </div>
  );
};

export default PostCard;
