import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Calendar,
  Image,
  Camera,
  MessageSquare,
  FileText,
  FolderOpen,
  Users,
  LogOut,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Bookings", icon: Calendar, to: "/admin/bookings" },
  { label: "Portfolio", icon: Image, to: "/admin/portfolio" },
  { label: "Services", icon: Camera, to: "/admin/services" },
  { label: "Testimonials", icon: MessageSquare, to: "/admin/testimonials" },
  { label: "Blog", icon: FileText, to: "/admin/blog" },
  { label: "Gallery", icon: FolderOpen, to: "/admin/gallery" },
  { label: "Users", icon: Users, to: "/admin/users" },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight">
              UR Studios
            </span>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              Admin
            </Badge>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : ""
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
