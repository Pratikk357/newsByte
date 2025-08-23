import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  Shield,
  Newspaper,
  Eye,
  LogOut
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/pages/AdminDashboard";

const adminItems = [
  // { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
  // { title: "Review News", url: "/admin/review", icon: Newspaper },
  { title: "Articles", url: "/admin/articles", icon: FileText },
  // { title: "Users", url: "/admin/users", icon: Users },
  // { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
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


  // Check if we're in a sidebar context, if not, default to expanded
  let collapsed = false;
  try {
    const sidebarContext = useSidebar();
    collapsed = sidebarContext.state === "collapsed";
  } catch (error) {
    // If useSidebar fails, default to expanded state
    collapsed = false;
  }

  const isActive = (path: string) => currentPath === path;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          {!collapsed && <span className="font-bold text-lg">Admin Panel</span>}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className="text-muted-foreground hover:text-foreground">
                    <Eye className="h-4 w-4" />
                    {!collapsed && <span>View Site</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground hover:text-foreground" onClick={()=> {
                  mutation.mutate({token: localStorage.getItem("accessToken")});
                }}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}