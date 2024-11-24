import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const News = () => {
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      // For now, we'll just show the latest posts as news
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          profiles:profiles (
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Latest News</h1>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : newsItems?.length === 0 ? (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No news available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsItems?.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {item.profiles?.username || "Anonymous"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{item.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default News;