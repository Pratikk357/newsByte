import { Clock, ExternalLink, Layers, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoryCoverage, coverageSources, sourceName } from "@/lib/sources";

interface ArticleCardProps {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category?: string;
  imageUrl?: string;
  coverage?: StoryCoverage[];
  onClick?: () => void;
}

const ArticleCard = ({
  title,
  summary,
  source,
  publishedAt,
  url,
  category,
  imageUrl,
  coverage,
  onClick
}: ArticleCardProps) => {
  const alsoCoveredBy = coverageSources(coverage);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-secondary/20"
      onClick={onClick}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {sourceName(source)}
            </Badge>
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(publishedAt)}
          </div>
        </div>
        
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-news-primary transition-colors">
          {title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
          {summary}
        </p>

        {alsoCoveredBy.length > 0 && (
          <p className="flex items-start text-xs text-muted-foreground mb-4">
            <Layers className="w-3 h-3 mr-1.5 mt-0.5 shrink-0" />
            <span>
              Also covered by{" "}
              <span className="font-medium text-foreground">{alsoCoveredBy.join(", ")}</span>
            </span>
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-news-primary hover:text-news-primary hover:bg-news-primary/10"
          >
            Read More
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                // Share functionality
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;