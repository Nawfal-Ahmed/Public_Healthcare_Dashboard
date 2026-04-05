import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListDiseases,
  useListMetrics,
  useCreateMetric,
  useUpdateMetric,
  useDeleteMetric,
  getListMetricsQueryKey,
  getListDiseasesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart2, Plus, Pencil, Trash2 } from "lucide-react";

const metricSchema = z.object({
  disease: z.string().min(1, "Disease is required"),
  metric: z.enum(["hospitalized", "recovered", "death_rate"]),
  value: z.coerce.number(),
  date: z.string().min(1, "Date is required"),
  region: z.string().min(1, "Region is required"),
});

type MetricFormData = z.infer<typeof metricSchema>;

const metricLabels = {
  hospitalized: "Hospitalized",
  recovered: "Recovered",
  death_rate: "Death Rate",
};

const metricColors = {
  hospitalized: "bg-orange-100 text-orange-700 border-orange-200",
  recovered: "bg-green-100 text-green-700 border-green-200",
  death_rate: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminMetricsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedDisease, setSelectedDisease] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: diseases, isLoading: diseasesLoading } = useListDiseases();
  const disease = selectedDisease || (diseases?.[0] ?? "");

  const { data: metrics, isLoading: metricsLoading } = useListMetrics(
    { disease },
    { query: { queryKey: getListMetricsQueryKey({ disease }), enabled: !!disease } }
  );

  const createMutation = useCreateMetric();
  const updateMutation = useUpdateMetric();
  const deleteMutation = useDeleteMetric();

  const form = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: { disease: disease, metric: "hospitalized", value: 0, date: "", region: "" },
  });

  function openCreate() {
    form.reset({ disease, metric: "hospitalized", value: 0, date: new Date().toISOString().slice(0, 10), region: "" });
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(metric: any) {
    form.reset({
      disease: metric.disease,
      metric: metric.metric,
      value: metric.value,
      date: metric.date,
      region: metric.region,
    });
    setEditingId(metric.id);
    setOpen(true);
  }

  async function onSubmit(data: MetricFormData) {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        toast({ title: "Metric updated" });
      } else {
        await createMutation.mutateAsync({ data });
        toast({ title: "Metric added" });
      }
      queryClient.invalidateQueries({ queryKey: getListMetricsQueryKey({ disease }) });
      queryClient.invalidateQueries({ queryKey: getListDiseasesQueryKey() });
      setOpen(false);
    } catch {
      toast({ title: "Operation failed", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Metric deleted" });
      queryClient.invalidateQueries({ queryKey: getListMetricsQueryKey({ disease }) });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteId(null);
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Disease Metrics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage hospitalization, recovery, and mortality data</p>
          </div>
          <Button data-testid="button-create-metric" onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Metric
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm font-medium whitespace-nowrap">Disease</label>
          {diseasesLoading ? (
            <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
          ) : (
            <Select value={disease} onValueChange={setSelectedDisease}>
              <SelectTrigger data-testid="select-disease" className="w-52">
                <SelectValue placeholder="Select disease" />
              </SelectTrigger>
              <SelectContent>
                {(diseases ?? []).map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {metricsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : !disease ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <BarChart2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No disease data available</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add a metric to get started</p>
          </div>
        ) : (metrics ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <BarChart2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No metrics for {disease}</p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-4">Add first metric</Button>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Disease</TableHead>
                  <TableHead className="text-xs font-semibold">Metric</TableHead>
                  <TableHead className="text-xs font-semibold">Value</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Region</TableHead>
                  <TableHead className="text-xs font-semibold w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(metrics ?? []).map((m) => (
                  <TableRow key={m.id} data-testid={`metric-row-${m.id}`}>
                    <TableCell className="text-sm font-medium">{m.disease}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${metricColors[m.metric as keyof typeof metricColors]}`}
                      >
                        {metricLabels[m.metric as keyof typeof metricLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {m.metric === "death_rate" ? `${m.value}%` : m.value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.region}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          data-testid={`button-edit-metric-${m.id}`}
                          variant="ghost"
                          size="sm"
                          className="p-1.5 h-7 w-7"
                          onClick={() => openEdit(m)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          data-testid={`button-delete-metric-${m.id}`}
                          variant="ghost"
                          size="sm"
                          className="p-1.5 h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Metric" : "Add Metric"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="disease" render={({ field }) => (
                <FormItem>
                  <FormLabel>Disease</FormLabel>
                  <FormControl><Input data-testid="input-metric-disease" placeholder="e.g. COVID-19" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="metric" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-metric">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hospitalized">Hospitalized</SelectItem>
                        <SelectItem value="recovered">Recovered</SelectItem>
                        <SelectItem value="death_rate">Death Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl><Input data-testid="input-metric-value" type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input data-testid="input-metric-date" type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="region" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl><Input data-testid="input-metric-region" placeholder="e.g. Northeast" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button data-testid="button-submit-metric" type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Metric</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button data-testid="button-confirm-delete-metric" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
