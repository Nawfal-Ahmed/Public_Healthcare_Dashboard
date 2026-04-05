import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Shield, Bell, Syringe, Users, BarChart2, LogOut, Menu, X, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/vaccinations", label: "Vaccination Info", icon: Syringe },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/metrics", label: "Metrics", icon: BarChart2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-sidebar w-64">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">HealthWatch</p>
            <p className="text-xs text-sidebar-foreground/50 font-medium">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2 mb-1">Management</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all group ${
                  active
                    ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/50">Administrator</p>
          </div>
        </div>
        <Button
          data-testid="button-logout"
          onClick={logout}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with hamburger */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-card md:hidden">
          <div className="flex items-center gap-2">
            <Button
              data-testid="button-hamburger"
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="font-bold text-sm">HealthWatch Admin</span>
          </div>
          <span className="text-xs text-muted-foreground">{user?.name}</span>
        </header>

        {/* Desktop header bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-card/50">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.href === location)?.label ?? "Admin Console"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage public health data and system configuration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full font-medium">Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
