import { Search, Menu, Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({ searchQuery = "", onSearchChange }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-xl font-bold bg-gradient-to-r from-news-primary to-news-accent bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                  NewsByte
                </h1>
              </Link>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center max-w-md w-full mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 bg-secondary/50 border-0 focus:bg-secondary"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile search button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-news-urgent text-white">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="text-news-primary">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex flex-col items-start p-4 cursor-pointer"
                  onClick={() => navigate('/article/1')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-news-urgent rounded-full"></div>
                    <span className="font-medium text-sm">Breaking News</span>
                    <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Major economic summit concludes with historic agreement
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex flex-col items-start p-4 cursor-pointer"
                  onClick={() => navigate('/article/2')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-news-trending rounded-full"></div>
                    <span className="font-medium text-sm">Trending</span>
                    <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Technology sector sees unprecedented growth this quarter
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex flex-col items-start p-4 cursor-pointer"
                  onClick={() => navigate('/article/3')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-news-secondary rounded-full"></div>
                    <span className="font-medium text-sm">Update</span>
                    <span className="text-xs text-muted-foreground ml-auto">3h ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your daily digest is ready with 12 new articles
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link to="/notifications">
                  <DropdownMenuItem className="text-center text-news-primary cursor-pointer">
                    View All Notifications
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            {/* About link - Desktop */}
            <Link to="/about">
              <Button variant="ghost" className="hidden md:inline-flex">
                About
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;