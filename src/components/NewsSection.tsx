import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

const NewsSection = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, category, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-heading font-semibold text-white mb-4">
          {t('home.news.title', 'Actualités')}
        </h3>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/10 border-0">
            <CardContent className="p-3">
              <Skeleton className="h-4 w-3/4 bg-white/20 mb-2" />
              <Skeleton className="h-3 w-full bg-white/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
          <Tag className="h-5 w-5 text-accent" />
          {t('home.news.title', 'Actualités')}
        </h3>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="bg-white/10 hover:bg-white/20 border-0 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {post.cover_image && (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.category && (
                          <Badge className="bg-accent/20 text-accent text-xs">
                            {post.category}
                          </Badge>
                        )}
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <Link to="/actualites">
        <Button 
          variant="ghost" 
          className="w-full text-white/80 hover:text-white hover:bg-white/10 group"
        >
          {t('home.news.viewAll', 'Voir toutes les actualités')}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  );
};

export default NewsSection;
