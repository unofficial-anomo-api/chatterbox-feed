import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import CommentsPanel from "../CommentsPanel";
import { useState } from "react";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import type { PostCardProps } from "./types";

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const session = useSession();
  const { toast } = useToast();
  const { liked, isSubscribed, handleLike, handleSubscribe } = usePostInteractions(post.id);

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
      <PostHeader 
        post={post} 
        onUpdate={onUpdate} 
        isOwnPost={isOwnPost} 
        onDelete={handleDelete}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
      />
      
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