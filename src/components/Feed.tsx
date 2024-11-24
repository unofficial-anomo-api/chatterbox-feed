import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

const Feed = () => {
  const [posts] = useState([
    {
      id: 1,
      author: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      },
      content: "Just testing out this new microblogging platform! #firstpost",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      likes: 42,
      comments: 7,
      is_anonymous: false,
      author_id: "1",
    },
    {
      id: 2,
      author: {
        name: "Jane Smith",
        avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      },
      content: "Beautiful day for coding! 💻 #coding #development",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      likes: 15,
      comments: 3,
      is_anonymous: false,
      author_id: "2",
    },
  ]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost />
      
      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="commented">Commented</TabsTrigger>
        </TabsList>
        
        <TabsContent value="popular" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
        
        <TabsContent value="following" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
        
        <TabsContent value="commented" className="space-y-4 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feed;