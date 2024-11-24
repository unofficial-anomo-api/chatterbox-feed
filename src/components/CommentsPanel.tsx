import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { EyeOff, Send } from "lucide-react";
import { Switch } from "./ui/switch";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  author: {
    username: string;
    avatar_url: string;
  };
}

interface CommentsPanelProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  isAuthorAnonymous?: boolean;
  authorId?: string;
}

const CommentsPanel = ({ postId, isOpen, onClose, isAuthorAnonymous, authorId }: CommentsPanelProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setupRealtimeSubscription();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          is_anonymous,
          author:profiles (
            username,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleSubmit = async () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: newComment,
        author_id: session.user.id,
        is_anonymous: isAnonymous,
      });

      if (error) throw error;

      setNewComment("");
      toast({
        description: "Comment added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const canCommentAnonymously = isAuthorAnonymous && session?.user?.id === authorId;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Comments</h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  {comment.is_anonymous ? (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={comment.author.avatar_url || "/placeholder.svg"}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {comment.is_anonymous ? "Anonymous" : comment.author.username}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t mt-auto">
            {canCommentAnonymously && (
              <div className="flex items-center space-x-2 mb-2">
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  id="anonymous-mode"
                />
                <label
                  htmlFor="anonymous-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Comment anonymously
                </label>
              </div>
            )}
            <div className="flex space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[80px]"
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsPanel;