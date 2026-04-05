import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListReports,
  useDeleteReport,
  getListReportsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Trash2, MapPin, Calendar, Phone, User } from "lucide-react";

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: reports, isLoading } = useListReports();
  const deleteMutation = useDeleteReport();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Report deleted" });
      queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteId(null);
  }

  const totalReports = (reports ?? []).length;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold">User Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage user self-reports</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Reports</p>
            <p className="text-2xl font-bold">{totalReports}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (reports ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No reports found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(reports ?? []).map((report) => (
              <Card key={report.id} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <p className="font-semibold text-sm">{report.name}</p>
                        <Badge variant="outline" className="text-xs">
                          Report #{report.id.slice(-6)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {report.phoneNumber}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Submitted {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-foreground">Symptoms:</p>
                        <p className="text-sm text-muted-foreground">{report.symptoms}</p>
                      </div>
                      {report.additionalInfo && (
                        <div>
                          <p className="text-sm font-medium text-foreground">Additional Info:</p>
                          <p className="text-sm text-muted-foreground">{report.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={() => setDeleteId(report.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Report</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this report? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}