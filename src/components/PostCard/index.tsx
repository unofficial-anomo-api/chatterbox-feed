import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import CommentsPanel from "../CommentsPanel";
import type { PostCardProps } from "./types";

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  useEffect(() => {
    checkIfLiked();
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

  const isOwnPost = session?.user?.id === post.author_id;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <PostHeader post={post} onUpdate={onUpdate} isOwnPost={isOwnPost} />
      
      <p className="text-gray-800">{post.content}</p>

      <PostActions
        post={post}
        liked={liked}
        onLike={handleLike}
        onComment={() => setIsCommentsPanelOpen(true)}
      />

      <CommentsPanel
        postId={post.id}
        isOpen={isCommentsPanelOpen}
        onClose={() => setIsCommentsPanelOpen(false)}
        isAuthorAnonymous={post.is_anonymous}
        authorId={post.author_id}
      />
    </div>
  );
};

export default PostCard;