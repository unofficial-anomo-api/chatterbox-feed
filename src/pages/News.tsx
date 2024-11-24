import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper, Loader2, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    avatar_url: string | null;
  };
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    author: {
      username: string;
      avatar_url: string | null;
    };
  }>;
}

const News = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { data: newsPosts, isLoading } = useQuery({
    queryKey: ["news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select(`
          id,
          title,
          content,
          created_at,
          author:profiles!news_posts_author_id_fkey (
            username,
            avatar_url
          ),
          comments:news_comments (
            id,
            content,
            created_at,
            author:profiles!news_comments_author_id_fkey (
              username,
              avatar_url
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NewsPost[];
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase
        .from("news_comments")
        .insert({
          news_post_id: postId,
          author_id: user?.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-posts"] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    addComment.mutate({ postId, content: newComment });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Latest News</h1>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : newsPosts?.length === 0 ? (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No news available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {newsPosts?.map((post) => (
              <Card key={post.id} className="w-full">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Posted by {post.author.username} on{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">
                        {post.comments.length} Comments
                      </span>
                    </div>

                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-l-2 border-muted pl-4 py-2 mb-4"
                      >
                        <p className="text-sm font-medium">
                          {comment.author.username}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                        <p>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  {selectedPostId === post.id ? (
                    <div className="w-full space-y-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAddComment(post.id)}
                          disabled={addComment.isPending}
                        >
                          {addComment.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add Comment
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedPostId(null);
                            setNewComment("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedPostId(post.id)}
                    >
                      Write a comment
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default News;