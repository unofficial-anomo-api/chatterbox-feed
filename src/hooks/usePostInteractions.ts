import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const usePostInteractions = (postId: string) => {
  const [liked, setLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id && postId) {
      checkIfLiked();
      checkIfSubscribed();
    }
  }, [postId, session?.user?.id]);

  const checkIfLiked = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.user.id);

    setLiked(data && data.length > 0);
  };

  const checkIfSubscribed = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.user.id);

    setIsSubscribed(data && data.length > 0);
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
          .eq("post_id", postId)
          .eq("user_id", session.user.id);
      } else {
        await supabase
          .from("likes")
          .insert({
            post_id: postId,
            user_id: session.user.id,
          });
      }

      setLiked(!liked);
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
          .eq("post_id", postId)
          .eq("user_id", session.user.id);
      } else {
        await supabase
          .from("subscriptions")
          .insert({
            post_id: postId,
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

  return {
    liked,
    isSubscribed,
    handleLike,
    handleSubscribe
  };
};