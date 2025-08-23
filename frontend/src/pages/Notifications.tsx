import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "urgent",
      title: "Breaking News",
      message: "Major economic summit concludes with historic agreement",
      time: "2m ago",
      unread: true
    },
    {
      id: 2,
      type: "trending",
      title: "Trending",
      message: "Technology sector sees unprecedented growth this quarter",
      time: "1h ago",
      unread: true
    },
    {
      id: 3,
      type: "update",
      title: "Update",
      message: "Your daily digest is ready with 12 new articles",
      time: "3h ago",
      unread: true
    },
    {
      id: 4,
      type: "trending",
      title: "Market Update",
      message: "Stock market reaches new all-time high amid positive earnings reports",
      time: "5h ago",
      unread: false
    },
    {
      id: 5,
      type: "update",
      title: "Weekly Summary",
      message: "Your weekly news digest with 45 articles is now available",
      time: "1d ago",
      unread: false
    },
    {
      id: 6,
      type: "urgent",
      title: "Weather Alert",
      message: "Severe weather warning issued for multiple regions",
      time: "2d ago",
      unread: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-news-urgent";
      case "trending":
        return "bg-news-trending";
      case "update":
        return "bg-news-secondary";
      default:
        return "bg-muted";
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-news-primary/5 via-background to-news-accent/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-news-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-news-primary to-news-accent bg-clip-text text-transparent">
                All Notifications
              </h1>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-lg ${
                  notification.unread ? 'border-l-4 border-l-news-primary bg-card/80' : 'bg-card/60'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(notification.type)}`}></div>
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      {notification.unread && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {notification.time}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{notification.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State (if no notifications) */}
          {notifications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  You'll see your latest updates and alerts here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;