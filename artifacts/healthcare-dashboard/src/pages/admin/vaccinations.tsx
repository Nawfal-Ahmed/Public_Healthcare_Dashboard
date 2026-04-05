import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListVaccinations,
  useCreateVaccination,
  useUpdateVaccination,
  useDeleteVaccination,
  getListVaccinationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Syringe, Plus, Pencil, Trash2 } from "lucide-react";

const vaccSchema = z.object({
  disease: z.string().min(1, "Disease is required"),
  vaccineName: z.string().min(1, "Vaccine name is required"),
  description: z.string().min(1, "Description is required"),
  dosesRequired: z.coerce.number().min(1),
  eligibility: z.string().min(1, "Eligibility is required"),
  availability: z.string().min(1, "Availability is required"),
  area: z.string().min(1, "Area is required"),
});

type VaccFormData = z.infer<typeof vaccSchema>;

export default function AdminVaccinationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: vaccinations, isLoading } = useListVaccinations();
  const createMutation = useCreateVaccination();
  const updateMutation = useUpdateVaccination();
  const deleteMutation = useDeleteVaccination();

  const form = useForm<VaccFormData>({
    resolver: zodResolver(vaccSchema),
    defaultValues: {
      disease: "", vaccineName: "", description: "",
      dosesRequired: 1, eligibility: "", availability: "", area: "",
    },
  });

  function openCreate() {
    form.reset({
      disease: "", vaccineName: "", description: "",
      dosesRequired: 1, eligibility: "", availability: "", area: "",
    });
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(vacc: any) {
    form.reset({
      disease: vacc.disease,
      vaccineName: vacc.vaccineName,
      description: vacc.description,
      dosesRequired: vacc.dosesRequired,
      eligibility: vacc.eligibility,
      availability: vacc.availability,
      area: vacc.area,
    });
    setEditingId(vacc.id);
    setOpen(true);
  }

  async function onSubmit(data: VaccFormData) {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        toast({ title: "Vaccination info updated" });
      } else {
        await createMutation.mutateAsync({ data });
        toast({ title: "Vaccination info created" });
      }
      queryClient.invalidateQueries({ queryKey: getListVaccinationsQueryKey() });
      setOpen(false);
    } catch {
      toast({ title: "Operation failed", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Vaccination info deleted" });
      queryClient.invalidateQueries({ queryKey: getListVaccinationsQueryKey() });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteId(null);
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Vaccination Info</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage vaccine programs visible to citizens</p>
          </div>
          <Button data-testid="button-create-vacc" onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Vaccine
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (vaccinations ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <Syringe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No vaccination info yet</p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-4">Add first vaccine</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(vaccinations ?? []).map((vacc) => (
              <Card key={vacc.id} data-testid={`vacc-row-${vacc.id}`} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Syringe className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{vacc.vaccineName}</h3>
                            <Badge variant="secondary" className="text-xs">{vacc.disease}</Badge>
                            <Badge variant="outline" className="text-xs">{vacc.dosesRequired} dose{vacc.dosesRequired > 1 ? "s" : ""}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{vacc.description}</p>
                          <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span>Eligibility: {vacc.eligibility}</span>
                            <span>Area: {vacc.area}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            data-testid={`button-edit-vacc-${vacc.id}`}
                            variant="ghost"
                            size="sm"
                            className="p-2 h-8 w-8"
                            onClick={() => openEdit(vacc)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-testid={`button-delete-vacc-${vacc.id}`}
                            variant="ghost"
                            size="sm"
                            className="p-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(vacc.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Vaccination Info" : "Add Vaccination Info"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="disease" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disease</FormLabel>
                    <FormControl><Input data-testid="input-vacc-disease" placeholder="e.g. COVID-19" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vaccineName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl><Input data-testid="input-vacc-name" placeholder="e.g. mRNA Booster" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea data-testid="input-vacc-desc" placeholder="Brief description..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="dosesRequired" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doses Required</FormLabel>
                    <FormControl><Input data-testid="input-vacc-doses" type="number" min={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl><Input data-testid="input-vacc-area" placeholder="e.g. Nationwide" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="eligibility" render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligibility</FormLabel>
                  <FormControl><Input data-testid="input-vacc-eligibility" placeholder="e.g. Adults 18+" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <FormControl><Input data-testid="input-vacc-availability" placeholder="e.g. Available at all pharmacies" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button data-testid="button-submit-vacc" type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Vaccination Info</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button data-testid="button-confirm-delete-vacc" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
