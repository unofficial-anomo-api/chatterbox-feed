export interface Post {
  id: string;
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

export interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}