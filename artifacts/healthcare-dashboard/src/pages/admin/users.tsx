import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListUsers,
  useDeleteUser,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Trash2, MapPin, Calendar, Shield, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: users, isLoading } = useListUsers();
  const deleteMutation = useDeleteUser();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "User deleted" });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setDeleteId(null);
  }

  const totalUsers = (users ?? []).filter((u) => u.role === "user").length;
  const totalAdmins = (users ?? []).filter((u) => u.role === "admin").length;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage registered user accounts</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Accounts</p>
            <p className="text-2xl font-bold">{(users ?? []).length}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Regular Users</p>
            <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Administrators</p>
            <p className="text-2xl font-bold text-purple-600">{totalAdmins}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (users ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(users ?? []).map((user) => (
              <Card key={user.id} data-testid={`user-row-${user.id}`} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {user.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{user.email}</span>
                        {user.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {user.id !== currentUser?.id && (
                      <Button
                        data-testid={`button-delete-user-${user.id}`}
                        variant="ghost"
                        size="sm"
                        className="p-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => setDeleteId(user.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user account? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              data-testid="button-confirm-delete-user"
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
