import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Globe, Users } from "lucide-react";
import Header from "@/components/Header";

const About = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-news-primary/5 via-background to-news-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-news-primary" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-news-primary to-news-accent bg-clip-text text-transparent">
              About NewsByte
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your intelligent news companion that transforms information overload into clear, digestible insights. 
            Stay informed without the overwhelm.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 border-news-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-news-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              In a world where news moves at lightning speed, we believe everyone deserves access to clear, 
              concise summaries that help them stay informed without sacrificing their time or mental energy.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center border-news-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-news-accent mx-auto mb-4" />
              <CardTitle className="text-news-primary">Lightning Fast</CardTitle>
              <CardDescription>
                Get the essence of any news story in seconds, not minutes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center border-news-secondary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="h-12 w-12 text-news-secondary mx-auto mb-4" />
              <CardTitle className="text-news-primary">Global Coverage</CardTitle>
              <CardDescription>
                Access news from trusted sources worldwide, all in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center border-news-trending/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-news-trending mx-auto mb-4" />
              <CardTitle className="text-news-primary">Community Focused</CardTitle>
              <CardDescription>
                Built for people who value their time and mental clarity
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-news-primary">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-news-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-news-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Collect</h3>
                <p className="text-sm text-muted-foreground">
                  We gather articles from trusted news sources worldwide
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-news-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-news-accent">2</span>
                </div>
                <h3 className="font-semibold mb-2">Summarize</h3>
                <p className="text-sm text-muted-foreground">
                  AI intelligently extracts key information and context
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-news-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-news-secondary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Deliver</h3>
                <p className="text-sm text-muted-foreground">
                  You get clear, actionable insights in seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-news-primary">Built With Excellence</CardTitle>
            <CardDescription className="text-center">
              Powered by cutting-edge technology for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">AI Summarization</Badge>
              <Badge variant="secondary">Real-time Updates</Badge>
              <Badge variant="secondary">Responsive Design</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default About;