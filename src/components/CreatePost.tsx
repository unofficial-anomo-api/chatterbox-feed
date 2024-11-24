import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ImagePlus } from "lucide-react";

const CreatePost = () => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post submission
    setContent("");
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
        <Button type="button" variant="outline" size="icon">
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Button type="submit" disabled={!content.trim()}>
          Post
        </Button>
      </div>
    </form>
  );
};

export default CreatePost;