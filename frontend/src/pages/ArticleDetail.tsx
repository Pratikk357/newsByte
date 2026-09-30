import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Share2, Clock, Bookmark, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
// import { mockdatas } from "@/data/mockdatas";
import Header from "@/components/Header";
import {  useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axios from "axios";
import { StoryCoverage, sourceName } from "@/lib/sources";
import { categoryLabel } from "@/lib/categories";


async function fetchArticleDetail({queryKey}) {
  const id = queryKey[1];
  const res = await axios.get('/news-articles/' + id );
  if (!res.data.success) throw new Error('Network error');
  return res.data;
}

const dataDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey : ['articles',id],
    queryFn: fetchArticleDetail,
    enabled: !!id
  });

  // if () {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <Header />
  //       <div className="container mx-auto px-4 py-8">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold mb-4">data Not Found</h1>
  //           <Button onClick={() => navigate("/")} variant="outline">
  //             <ArrowLeft className="w-4 h-4 mr-2" />
  //             Back to Home
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if(!data) return
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to datas
        </Button>

        <data className="space-y-6">
          {/* data header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{sourceName(data.responseObject.source)}</Badge>
              {data.responseObject.tags[0] && (
                <Badge variant="outline">{categoryLabel(data.responseObject.tags[0])}</Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {data.responseObject.title}
            </h1>
            
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(data.responseObject.publishedAt)}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.open(data.responseObject.sourceUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* data image */}
          {data.responseObject.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={data.responseObject.imageUrl}
                alt={data.responseObject.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Summary card */}
          <Card className="bg-gradient-to-r from-news-primary/5 to-news-accent/5 border-news-primary/20">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3 text-news-primary">
                Summary
              </h2>
              <p className="text-foreground leading-relaxed text-lg">
                {data.responseObject.summary}
              </p>
            </CardContent>
          </Card>

          {/* The same story from other sources */}
          {data.responseObject.coverage?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center text-lg font-semibold mb-4">
                  <Layers className="w-5 h-5 mr-2 text-news-primary" />
                  Also covered by
                </h2>
                <ul className="space-y-3">
                  {data.responseObject.coverage.map((c: StoryCoverage) => (
                    <li key={c.id}>
                      <button
                        onClick={() => navigate(`/article/${c.id}`)}
                        className="w-full text-left p-3 rounded-md hover:bg-secondary/60 transition-colors"
                      >
                        <Badge variant="outline" className="mb-1">{sourceName(c.source)}</Badge>
                        <p className="font-medium leading-snug">{c.title}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Full content placeholder */}
          {/* <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Full data Content</h2>
              <div className="prose prose-lg max-w-none">
                <p className="mb-4">
                  This is where the full data content would appear. In a real implementation, 
                  this would be fetched from the original news source or stored in the database 
                  after processing.
                </p>
                <p className="mb-4">
                  The content would include the complete data text, properly formatted with 
                  paragraphs, quotes, and other relevant information from the original source.
                </p>
                <p className="mb-4">
                  For demonstration purposes, this shows how the data detail page would look 
                  with the full content displayed in a clean, readable format.
                </p>
              </div>
            </CardContent>
          </Card> */}

          {/* Source and read original */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-secondary/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Original source:</p>
              <p className="font-medium">{sourceName(data.responseObject.source)}</p>
            </div>
            <Button 
              onClick={() => window.open(data.responseObject.sourceUrl, '_blank')}
              className="mt-4 sm:mt-0"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Read Original data
            </Button>
          </div>
        </data>
      </div>
    </div>
  );
};

export default dataDetail;