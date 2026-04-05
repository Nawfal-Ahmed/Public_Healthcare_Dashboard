import { useState } from "react";
import UserLayout from "@/components/UserLayout";
import { useListDiseases, useListMetrics, getListMetricsQueryKey } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2 } from "lucide-react";

type MetricType = "hospitalized" | "recovered" | "death_rate";

const metricConfig: Record<MetricType, { label: string; color: string; format: (v: number) => string }> = {
  hospitalized: { label: "Hospitalized", color: "#f97316", format: (v) => v.toLocaleString() },
  recovered: { label: "Recovered", color: "#22c55e", format: (v) => v.toLocaleString() },
  death_rate: { label: "Death Rate (%)", color: "#ef4444", format: (v) => `${v}%` },
};

function MetricChart({
  disease,
  metric,
}: {
  disease: string;
  metric: MetricType;
}) {
  const config = metricConfig[metric];
  const { data: metrics, isLoading } = useListMetrics(
    { disease, metric },
    { query: { queryKey: getListMetricsQueryKey({ disease, metric }) } }
  );

  const chartData = (metrics ?? [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: m.value,
    }));

  if (isLoading) {
    return <div className="h-48 bg-muted rounded-xl animate-pulse" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center bg-muted/30 rounded-xl border border-dashed">
        <BarChart2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">No {config.label.toLowerCase()} data</p>
      </div>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          {metric === "death_rate" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(val: number) => [config.format(val), config.label]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(val: number) => [config.format(val), config.label]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="value" stroke={config.color} fill={`${config.color}20`} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function ChartsPage() {
  const { data: diseases, isLoading: diseasesLoading } = useListDiseases();
  const [selectedDisease, setSelectedDisease] = useState<string>("");

  const disease = selectedDisease || (diseases?.[0] ?? "");

  return (
    <UserLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Disease Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track hospitalization, recovery, and mortality trends by disease
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">Select Disease</label>
          {diseasesLoading ? (
            <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
          ) : (
            <Select
              value={disease}
              onValueChange={setSelectedDisease}
            >
              <SelectTrigger data-testid="select-disease" className="w-52">
                <SelectValue placeholder="Choose disease..." />
              </SelectTrigger>
              <SelectContent>
                {(diseases ?? []).map((d) => (
                  <SelectItem key={d} value={d} data-testid={`option-disease-${d}`}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {disease ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-base font-semibold">{disease}</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All metrics</span>
            </div>
            {(["hospitalized", "recovered", "death_rate"] as MetricType[]).map((metric) => (
              <MetricChart key={metric} disease={disease} metric={metric} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border rounded-xl">
            <BarChart2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No disease data available</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Data will appear here once metrics are added by the admin</p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
