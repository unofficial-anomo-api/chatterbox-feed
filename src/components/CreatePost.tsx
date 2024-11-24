import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ImagePlus, EyeOff } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to post",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          content,
          author_id: session.user.id,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });
      
      setContent("");
      setIsAnonymous(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-4">
      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full mb-4"
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button type="button" variant="outline" size="icon">
            <ImagePlus className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous-mode"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous-mode" className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4" />
              <span>Post anonymously</span>
            </Label>
          </div>
        </div>
        <Button type="submit" disabled={!content.trim()}>
          Post
        </Button>
      </div>
    </form>
  );
};

export default CreatePost;