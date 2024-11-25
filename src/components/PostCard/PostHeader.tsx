import { EyeOff, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { PostCardProps } from "./types";
import PostMenu from "./PostMenu";

interface PostHeaderProps extends Pick<PostCardProps, "post" | "onUpdate"> {
  isOwnPost: boolean;
  onDelete: () => Promise<void>;
  isSubscribed: boolean;
  onSubscribe: () => Promise<void>;
}

const PostHeader = ({ post, onUpdate, isOwnPost, onDelete, isSubscribed, onSubscribe }: PostHeaderProps) => {
  return (
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
      
      <PostMenu 
        post={post} 
        onUpdate={onUpdate} 
        isOwnPost={isOwnPost} 
        onDelete={onDelete}
        isSubscribed={isSubscribed}
        onSubscribe={onSubscribe}
      />
    </div>
  );
};

export default PostHeader;