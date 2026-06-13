import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderOpen, Upload, X } from "lucide-react";
import type { Collection } from "@shared/schema";

interface CollectionForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  gallery: string[];
  subtitle: string;
  sortOrder: string;
}

const emptyForm: CollectionForm = { name: "", slug: "", description: "", image: "", gallery: [], subtitle: "", sortOrder: "0" };

export default function AdminCollections() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: collections = [], isLoading } = useQuery<Collection[]>({ queryKey: ["/api/collections"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/collections", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/collections"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); setDialogOpen(false); toast({ title: "Collection created" }); },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PUT", `/api/admin/collections/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/collections"] }); setDialogOpen(false); toast({ title: "Collection updated" }); },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/admin/collections/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/collections"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); setDeleteConfirm(null); toast({ title: "Collection deleted" }); },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (c: Collection) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", image: c.image || "", gallery: (c as any).gallery || [], subtitle: c.subtitle || "", sortOrder: String(c.sortOrder || 0) });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  const [imageUploading, setImageUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url }));
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setGalleryUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      const res = await fetch("/api/upload/multiple", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const urls: string[] = (data.files || data.urls || []).map((x: any) => x.url || x);
      setForm(f => ({ ...f, gallery: [...f.gallery, ...urls] }));
      toast({ title: `${urls.length} image(s) uploaded` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setGalleryUploading(false);
    }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">Collections</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">{collections.length} collections</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Collection
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        {collections.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No collections yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {collections.map(c => (
              <div key={c.id} className="p-4 px-6 flex items-center gap-4">
                {c.image && <img src={c.image} alt={c.name} className="w-16 h-16 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium">{c.name}</p>
                  <p className="font-sans text-xs text-gray-500">{c.subtitle} · /{c.slug}</p>
                </div>
                <span className="font-sans text-xs text-gray-400">Order: {c.sortOrder}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteConfirm(c.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader><DialogTitle className="font-serif text-xl">{editingId ? "Edit Collection" : "Add Collection"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : generateSlug(e.target.value) }))} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. Hand-Crafted" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Image</Label>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
              {form.image ? (
                <div className="relative rounded-md overflow-hidden border">
                  <img src={form.image} alt="Collection" className="w-full h-40 object-cover" />
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
                  className="w-full h-40 flex flex-col gap-2"
                  disabled={imageUploading}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">{imageUploading ? "Uploading..." : "Click to upload image"}</span>
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Gallery Images (optional)</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={galleryInputRef}
                className="hidden"
                onChange={e => { const fs = e.target.files; if (fs && fs.length) handleGalleryUpload(fs); e.target.value = ""; }}
              />
              {form.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {form.gallery.map((url, i) => (
                    <div key={i} className="relative rounded overflow-hidden border group">
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed h-12"
                disabled={galleryUploading}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {galleryUploading ? "Uploading..." : `Add ${form.gallery.length > 0 ? "more " : ""}gallery images`}
              </Button>
              <p className="font-sans text-xs text-gray-400">Upload up to 10 images to showcase this collection.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
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
          <DialogHeader><DialogTitle>Delete Collection</DialogTitle></DialogHeader>
          <p className="font-sans text-sm text-gray-600 mt-2">Are you sure? Products in this collection will not be deleted but will become unassigned.</p>
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
