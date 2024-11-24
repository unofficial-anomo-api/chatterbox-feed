import { Bell, BellOff, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { PostCardProps } from "./types";

interface PostMenuProps extends Pick<PostCardProps, "post" | "onUpdate"> {
  isOwnPost: boolean;
}

const PostMenu = ({ post, onUpdate, isOwnPost }: PostMenuProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const session = useSession();
  const { toast } = useToast();

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

  return (
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
  );
};

export default PostMenu;