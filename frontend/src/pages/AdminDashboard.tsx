import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell 
} from "recharts";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  LogOut,
  Eye,
  MessageSquare,
  Clock,
  Shield
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";


export async function logout(data) {
  const res = await axios.post('/auth/logout',data, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`
  }
  });
  if (!res.data.success) throw new Error('Error verifying JWT');
  return res.data;
}




const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      if(data.success) {
            queryClient.invalidateQueries({
                queryKey: ['adminData'],
            });
            navigate("/");
            localStorage.removeItem("accessToken");
        }
      
    },
    onError :(error)=> {
      
    }
  });

  // Mock data for charts
  const articleData = [
    { name: "Mon", articles: 12, views: 2400 },
    { name: "Tue", articles: 15, views: 3200 },
    { name: "Wed", articles: 8, views: 1800 },
    { name: "Thu", articles: 18, views: 4100 },
    { name: "Fri", articles: 22, views: 5200 },
    { name: "Sat", articles: 14, views: 3100 },
    { name: "Sun", articles: 16, views: 3800 }
  ];

  const categoryData = [
    { name: "Politics", value: 35, color: "#8B5CF6" },
    { name: "Technology", value: 25, color: "#3B82F6" },
    { name: "Business", value: 20, color: "#10B981" },
    { name: "Science", value: 12, color: "#F59E0B" },
    { name: "Sports", value: 8, color: "#EF4444" }
  ];

  const recentArticles = [
    { id: 1, title: "Breaking: Major Economic Summit Concludes", status: "published", views: 1250, time: "2h ago" },
    { id: 2, title: "Tech Giants Report Q4 Earnings", status: "draft", views: 0, time: "4h ago" },
    { id: 3, title: "Climate Change Conference Updates", status: "published", views: 890, time: "6h ago" },
    { id: 4, title: "Sports Championship Finals Tonight", status: "scheduled", views: 0, time: "8h ago" },
    { id: 5, title: "New Scientific Discovery Announced", status: "published", views: 567, time: "12h ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6 justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-news-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={()=> {
              mutation.mutate({ token: localStorage.getItem("accessToken")})
            }}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,942</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-yellow-600">5</span> urgent items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles & Views Trend</CardTitle>
              <CardDescription>Daily article publication and view statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={articleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="articles" fill="#8B5CF6" name="Articles" />
                  <Bar dataKey="views" fill="#3B82F6" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article Categories</CardTitle>
              <CardDescription>Distribution of articles by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage articles, users, and system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="articles" className="space-y-4">
              <TabsList>
                <TabsTrigger value="articles">Recent Articles</TabsTrigger>
                <TabsTrigger value="users">User Activity</TabsTrigger>
                <TabsTrigger value="system">System Health</TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Recent Articles</h3>
                  <Button size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {recentArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{article.title}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge 
                            variant={
                              article.status === "published" ? "default" :
                              article.status === "draft" ? "secondary" : "outline"
                            }
                          >
                            {article.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {article.views} views
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {article.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">User Management</h3>
                  <p className="text-muted-foreground">Track user engagement and manage accounts</p>
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Server Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="text-sm">Online</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Database</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="text-sm">Connected</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">API Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                        <span className="text-sm">Monitoring</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;