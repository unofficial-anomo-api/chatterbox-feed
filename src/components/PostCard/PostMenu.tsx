import { Bell, BellOff, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { PostCardProps } from "./types";

interface PostMenuProps extends Pick<PostCardProps, "post" | "onUpdate"> {
  isOwnPost: boolean;
  onDelete: () => Promise<void>;
  isSubscribed: boolean;
  onSubscribe: () => Promise<void>;
}

const PostMenu = ({ post, onUpdate, isOwnPost, onDelete, isSubscribed, onSubscribe }: PostMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Share</DropdownMenuItem>
        {!isOwnPost && (
          <>
            <DropdownMenuItem onClick={onSubscribe}>
              {isSubscribed ? (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Unsubscribe
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>Follow User</DropdownMenuItem>
            <DropdownMenuItem>Mute User</DropdownMenuItem>
            <DropdownMenuItem>Block User</DropdownMenuItem>
            <DropdownMenuItem>Chat</DropdownMenuItem>
          </>
        )}
        {isOwnPost && (
          <>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={onDelete}
            >
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostMenu;