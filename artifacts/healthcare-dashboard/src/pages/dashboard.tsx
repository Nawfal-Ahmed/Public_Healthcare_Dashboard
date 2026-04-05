import { useAuth } from "@/lib/auth";
import UserLayout from "@/components/UserLayout";
import { useListAlerts, useGetMetricsSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle, Activity, TrendingUp, TrendingDown } from "lucide-react";

const severityConfig = {
  low: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Info, border: "border-l-blue-400" },
  medium: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle, border: "border-l-amber-400" },
  high: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle, border: "border-l-orange-500" },
  critical: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle, border: "border-l-red-500" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: alerts, isLoading: alertsLoading } = useListAlerts();
  const { data: summary, isLoading: summaryLoading } = useGetMetricsSummary();

  const activeAlerts = alerts?.filter((a) => a.isActive) ?? [];

  return (
    <UserLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Health Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {user?.name}. Stay informed about public health updates.
          </p>
        </div>

        {/* Active Alerts */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Active Health Alerts</h2>
            {activeAlerts.length > 0 && (
              <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                {activeAlerts.length} active
              </span>
            )}
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="text-center py-10 bg-card border rounded-xl">
              <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No active alerts at this time</p>
              <p className="text-xs text-muted-foreground/60 mt-1">All clear — continue practicing healthy habits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const config = severityConfig[alert.severity as keyof typeof severityConfig];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    data-testid={`alert-card-${alert.id}`}
                    className={`bg-card border rounded-xl p-4 border-l-4 ${config.border} shadow-sm transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-current opacity-70" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-foreground">{alert.title}</h3>
                          <Badge className={`${config.color} text-xs capitalize flex-shrink-0`} variant="outline">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {new Date(alert.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Disease Summary */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Disease Overview</h2>
          {summaryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (summary ?? []).length === 0 ? (
            <div className="text-center py-10 bg-card border rounded-xl">
              <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No disease data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(summary ?? []).map((item) => (
                <Card key={item.disease} data-testid={`summary-card-${item.disease}`} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {item.disease}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.hospitalized != null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Hospitalized</span>
                        <span className="font-semibold text-orange-600">{item.hospitalized.toLocaleString()}</span>
                      </div>
                    )}
                    {item.recovered != null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recovered</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                          <span className="font-semibold text-green-600">{item.recovered.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    {item.death_rate != null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Death Rate</span>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                          <span className="font-semibold text-red-600">{item.death_rate}%</span>
                        </div>
                      </div>
                    )}
                    {item.lastUpdated && (
                      <p className="text-xs text-muted-foreground/50 pt-1 border-t">
                        Updated {new Date(item.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </UserLayout>
  );
}
