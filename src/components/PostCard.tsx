import { useState } from "react";
import { Heart, MoreVertical, MessageSquare, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@supabase/auth-helpers-react";

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  is_anonymous: boolean;
  author_id: string;
}

const PostCard = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const session = useSession();

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const isOwnPost = session?.user?.id === post.author_id;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {post.is_anonymous ? (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={post.author.avatar}
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Share</DropdownMenuItem>
            {isOwnPost ? (
              <>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>Follow User</DropdownMenuItem>
                <DropdownMenuItem>Mute User</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Chat</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-gray-800">{post.content}</p>

      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={liked ? "text-red-500" : ""}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-500">{likesCount}</span>
        </div>

        <Button variant="ghost" className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm text-gray-500">{post.comments}</span>
        </Button>
      </div>
    </div>
  );
};

export default PostCard;