import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setBaseUrl } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import VaccinationsPage from "@/pages/vaccinations";
import SelfReportPage from "@/pages/self-report";
import BlogsPage from "@/pages/blogs";
import CreateBlogPage from "@/pages/create-blog";
import BlogDetailPage from "@/pages/blog-detail";
import ChartsPage from "@/pages/charts";
import AdminAlertsPage from "@/pages/admin/alerts";
import AdminVaccinationsPage from "@/pages/admin/vaccinations";
import AdminUsersPage from "@/pages/admin/users";
import AdminReportsPage from "@/pages/admin/reports";
import AdminMetricsPage from "@/pages/admin/metrics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, role }: { component: () => JSX.Element; role?: "admin" | "user" }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (role && user.role !== role) {
    return <Redirect to={user.role === "admin" ? "/admin/alerts" : "/dashboard"} />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Redirect to={user.role === "admin" ? "/admin/alerts" : "/dashboard"} />;
  }

  return <Component />;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  return <Redirect to={user.role === "admin" ? "/admin/alerts" : "/dashboard"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/login" component={() => <PublicRoute component={LoginPage} />} />
      <Route path="/register" component={() => <PublicRoute component={RegisterPage} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} role="user" />} />
      <Route path="/vaccinations" component={() => <ProtectedRoute component={VaccinationsPage} role="user" />} />
      <Route path="/self-report" component={() => <ProtectedRoute component={SelfReportPage} role="user" />} />
      <Route path="/blogs" component={() => <ProtectedRoute component={BlogsPage} />} />
      <Route path="/blogs/create" component={() => <ProtectedRoute component={CreateBlogPage} />} />
      <Route path="/blogs/:id" component={() => <ProtectedRoute component={BlogDetailPage} />} />
      <Route path="/charts" component={() => <ProtectedRoute component={ChartsPage} role="user" />} />
      <Route path="/admin/alerts" component={() => <ProtectedRoute component={AdminAlertsPage} role="admin" />} />
      <Route path="/admin/vaccinations" component={() => <ProtectedRoute component={AdminVaccinationsPage} role="admin" />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsersPage} role="admin" />} />
      <Route path="/admin/reports" component={() => <ProtectedRoute component={AdminReportsPage} role="admin" />} />
      <Route path="/admin/metrics" component={() => <ProtectedRoute component={AdminMetricsPage} role="admin" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set API base URL for development
  setBaseUrl("http://localhost:3000");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
