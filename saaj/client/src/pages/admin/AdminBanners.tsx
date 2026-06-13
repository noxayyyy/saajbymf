import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Image, Upload, X } from "lucide-react";
import type { Banner } from "@shared/schema";

interface BannerForm {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: BannerForm = {
  image: "", title: "", subtitle: "", link: "/shop", isActive: true, sortOrder: "0",
};

export default function AdminBanners() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: bannersRaw, isLoading } = useQuery<Banner[] | null>({
    queryKey: ["/api/admin/banners"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const banners = Array.isArray(bannersRaw) ? bannersRaw : [];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/banners", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setDialogOpen(false);
      toast({ title: "Banner created" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/banners/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setDialogOpen(false);
      toast({ title: "Banner updated" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/admin/banners/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setDeleteConfirm(null);
      toast({ title: "Banner deleted" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url }));
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      image: b.image,
      title: b.title || "",
      subtitle: b.subtitle || "",
      link: b.link || "/shop",
      isActive: b.isActive ?? true,
      sortOrder: String(b.sortOrder ?? 0),
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast({ title: "Please upload a banner image", variant: "destructive" });
      return;
    }
    const data = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">Hero Banners</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">{banners.length} banners · Displayed on the home page slider</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        {banners.length === 0 ? (
          <div className="p-12 text-center">
            <Image className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No banners yet. Add your first banner image.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map(b => (
              <div key={b.id} className="p-4 px-6 flex items-center gap-4">
                <img src={b.image} alt={b.title || "Banner"} className="w-24 h-14 object-cover rounded border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium truncate">{b.title || "(No title)"}</p>
                  <p className="font-sans text-xs text-gray-500 truncate">{b.subtitle}</p>
                </div>
                <span className={`font-sans text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${b.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>
                <span className="font-sans text-xs text-gray-400">Order: {b.sortOrder}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(b)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteConfirm(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingId ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Banner Image *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = "";
                }}
              />
              {form.image ? (
                <div className="relative rounded-md overflow-hidden border">
                  <img src={form.image} alt="Banner preview" className="w-full h-48 object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setForm(f => ({ ...f, image: "" }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-48 flex flex-col gap-2"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">{uploading ? "Uploading..." : "Click to upload banner image"}</span>
                  <span className="text-xs text-gray-400">Recommended: 1920×1080 or wider</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. SAAJ" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Subtitle</Label>
                <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. New Collection" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Link (URL)</Label>
              <Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/shop" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Active</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                  />
                  <span className="font-sans text-sm text-gray-600">{form.isActive ? "Visible" : "Hidden"}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Banner</DialogTitle></DialogHeader>
          <p className="font-sans text-sm text-gray-600 mt-2">Are you sure you want to delete this banner?</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
