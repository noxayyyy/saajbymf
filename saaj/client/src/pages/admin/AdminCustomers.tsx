import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  role: string;
  createdAt: string | null;
}

export default function AdminCustomers() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: usersRaw, isLoading } = useQuery<SafeUser[] | null>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const users = Array.isArray(usersRaw) ? usersRaw : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Customer deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Delete failed", description: err?.message, variant: "destructive" });
    },
  });

  const handleDelete = (u: SafeUser) => {
    if (window.confirm(`Delete customer ${u.firstName} ${u.lastName} (${u.email})? Their past orders will be kept as guest orders.`)) {
      deleteMutation.mutate(u.id);
    }
  };

  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" }) : "";

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-wide">Customers</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No customers yet</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Email</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Phone</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Location</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Role</th>
                <th className="px-6 py-3 text-left font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Joined</th>
                <th className="px-6 py-3 text-right font-sans text-[10px] tracking-[0.15em] uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} data-testid={`row-customer-${user.id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-sans text-xs font-medium text-gray-600">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span className="font-sans text-sm">{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 font-sans text-sm text-gray-600">{user.phone || "—"}</td>
                  <td className="px-6 py-4 font-sans text-sm text-gray-600">{[user.city, user.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] tracking-wide uppercase rounded ${
                      user.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-gray-50 text-gray-600"
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 font-sans text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(user)}
                      disabled={deleteMutation.isPending || user.id === currentUser?.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                      title={user.id === currentUser?.id ? "You cannot delete your own account" : "Delete customer"}
                      data-testid={`button-delete-customer-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
