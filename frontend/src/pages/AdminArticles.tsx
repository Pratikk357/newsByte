import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { mockArticles } from "@/data/mockArticles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticles } from "./Index";
import axios from "axios";


interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  readTime: string;
  status: 'published' | 'draft' | 'archived';
}

const AdminArticles = () => {
  const { toast } = useToast();
  // const [articles, setArticles] = useState<Article[]>(
  //   mockarticles.responseObject.data.map(article => ({
  //     ...article,
  //     excerpt: article.summary,
  //     author: article.source,
  //     content: "Full article content would be here...",
  //     readTime: "5 min read",
  //     status: 'published' as const,
  //     imageUrl: article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop"
  //   }))
  // );
  
  const { data : articles, isLoading, error } = useQuery({
    queryKey : ['articles'],
    queryFn: fetchArticles,
  });


  const queryClient = useQueryClient();

  const deleteArticle = useMutation({
    mutationFn: async (data : any) => {
      const res = await axios.delete('/news-articles', {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        data
      });
      if (!res.data.success) throw new Error(res.data.message || 'Failed to delete article');
      return res.data; 
    },
    onSuccess: (data) => {
      // console.log("Login successful:");
      queryClient.invalidateQueries({
        queryKey: ['articles'],
      });
    },
    onError : (error)=> {

    }
  });


  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if(!articles) {
    return <div> No Articles... </div>
  }
    const filteredArticles = articles?.responseObject.data.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(articles.responseObject.data.map(article => article.category)));

  const handleDeleteArticle = (id) => {
    deleteArticle.mutate({id});
        toast({
      title: "Deleted",
      description: "The article has been successfully deleted.",
    });
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    // setArticles(articles.responseObject.data.map(article => 
    //   article.id === updatedArticle.id ? updatedArticle : article
    // ));
    // setEditingArticle(null);
    // toast({
    //   title: "Article updated",
    //   description: "The article has been successfully updated.",
    // });
  };

  const handleCreateArticle = (newArticle: Omit<Article, 'id'>) => {
    // const article: Article = {
    //   ...newArticle,
    //   id: Date.now().toString(),
    // };
    // setArticles([article, ...articles]);
    // setIsCreateDialogOpen(false);
    // toast({
    //   title: "Article created",
    //   description: "The article has been successfully created.",
    // });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Article Management</h1>
          <p className="text-muted-foreground">Manage all articles on your platform</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ArticleForm 
              onSubmit={handleCreateArticle}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category : any) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card> */}

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Articles ({filteredArticles.length})</CardTitle>
            <Badge variant="outline" className="text-sm">
              Total: {articles.responseObject.data.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Published</TableHead>
                  {/* <TableHead>Read Time</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-1">{article.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {article.excerpt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{article.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{article.tags[0].replaceAll("/","")}</Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Badge className={getStatusBadge(article.status)}>
                        {article.status}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    {/* <TableCell className="text-sm text-muted-foreground">
                      {article.readTime}
                    </TableCell> */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Article
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem onClick={() => setEditingArticle(article)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Article
                          </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Article
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the article.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={()=> {
                                  const event = new KeyboardEvent("keydown", {
                                    key: "Escape",
                                    code: "Escape",
                                    keyCode: 27, 
                                    bubbles: true,
                                    cancelable: true
                                  });
                                  setTimeout(()=> {
                                    document.body.dispatchEvent(event);
                                  },200)
                                }

                                }> Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    handleDeleteArticle(article.id)
                                    const event = new KeyboardEvent("keydown", {
                                      key: "Escape",
                                      code: "Escape",
                                      keyCode: 27, 
                                      bubbles: true,
                                      cancelable: true
                                    });
                                    setTimeout(()=> {
                                      document.body.dispatchEvent(event);
                                    },200)
                                  }}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredArticles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No articles found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Article Dialog */}
      {editingArticle && (
        <Dialog open={true} onOpenChange={() => setEditingArticle(null)}>
          <DialogContent className="max-w-2xl">
            <ArticleForm 
              article={editingArticle}
              onSubmit={handleUpdateArticle}
              onCancel={() => setEditingArticle(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface ArticleFormProps {
  article?: Article;
  onSubmit: (article: Article | Omit<Article, 'id'>) => void;
  onCancel: () => void;
}

const ArticleForm = ({ article, onSubmit, onCancel }: ArticleFormProps) => {
  const [formData, setFormData] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "",
    author: article?.author || "",
    imageUrl: article?.imageUrl || "",
    readTime: article?.readTime || "",
    status: article?.status || "draft" as const,
    publishedAt: article?.publishedAt || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (article) {
      onSubmit({ ...article, ...formData });
    } else {
      onSubmit({ ...formData, publishedAt: new Date().toISOString() });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{article ? 'Edit Article' : 'Create New Article'}</DialogTitle>
        <DialogDescription>
          {article ? 'Update the article details below.' : 'Fill in the details to create a new article.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="readTime">Read Time</Label>
            <Input
              id="readTime"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              placeholder="5 min read"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {article ? 'Update Article' : 'Create Article'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default AdminArticles;