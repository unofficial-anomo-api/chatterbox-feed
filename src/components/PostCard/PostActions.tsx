import { Heart, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { PostCardProps } from "./types";

interface PostActionsProps extends Pick<PostCardProps, "post"> {
  liked: boolean;
  onLike: () => void;
  onComment: () => void;
}

const PostActions = ({ post, liked, onLike, onComment }: PostActionsProps) => {
  return (
    <div className="flex justify-between items-center pt-2">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onLike}
          className={liked ? "text-red-500" : ""}
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
        </Button>
        <span className="text-sm text-gray-500">{post.likes}</span>
      </div>

      <Button 
        variant="ghost" 
        className="flex items-center space-x-2"
        onClick={onComment}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm text-gray-500">{post.comments}</span>
      </Button>
    </div>
  );
};

export default PostActions;