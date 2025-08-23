import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import CategoryTabs from "@/components/CategoryTabs";
import { mockArticles } from "@/data/mockArticles";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


export const formatTime = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function fetchArticles() {
  const res = await axios.get('/news-articles?limit=100');
  if (!res.data.success) throw new Error('Network error');
  return res.data;
}


const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();


  const { data, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  const [filteredArticles, setFilteredArticles] = useState([]);
  useEffect(() => {
    if (data) {
      setFilteredArticles(data.responseObject.data.filter(article => {
        const matchesCategory = activeCategory.toLowerCase() === "all" || article.tags[0].toLowerCase() === activeCategory;
        const matchesSearch = searchQuery === "" ||
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.source.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }));
    }

  }, [data, activeCategory, searchQuery])


  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-news-primary to-news-accent text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Stay Informed, Stay Ahead
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-6 max-w-2xl mx-auto">
            Get the essence of today's news in just 2-3 sentences.
            No clutter, no bias, just the facts.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Real-time updates</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>2-3 sentence summaries</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <span>Trusted sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </section>

      {/* Articles Grid */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">
              {activeCategory === "all" ? "Latest News" : `${activeCategory.replace("/", "").charAt(0).toUpperCase() + activeCategory.replace("/", "").slice(1)} News`}
            </h2>
            <Badge variant="secondary" className="text-sm">
              {filteredArticles.length} articles
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {/* Updated 2 hours ago */}
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              {...article}
              onClick={() => handleArticleClick(article.id)}
            />
          ))}
        </div>

        {/* Load more placeholder */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            You've reached the end of current articles
          </p>
          <p className="text-sm text-muted-foreground">
            New articles are automatically added every 6 hours
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
