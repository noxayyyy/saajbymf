import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Upload, X, GripVertical, ImagePlus } from "lucide-react";
import type { Product, Collection } from "@shared/schema";

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  image: string;
  hoverImage: string;
  gallery: string[];
  color: string;
  sku: string;
  fabric: string;
  pieces: string;
  collectionId: string;
  isNew: boolean;
  isFeatured: boolean;
}

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", price: "", currency: "PKR",
  image: "", hoverImage: "", gallery: [], color: "", sku: "",
  fabric: "", pieces: "",
  collectionId: "", isNew: false, isFeatured: false,
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, field: "image" | "hoverImage") => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(f => ({ ...f, [field]: data.url }));
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      const res = await fetch("/api/upload/multiple", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(f => ({ ...f, gallery: [...f.gallery, ...data.urls] }));
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm(f => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: collections = [] } = useQuery<Collection[]>({ queryKey: ["/api/collections"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDialogOpen(false);
      toast({ title: "Product created" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDialogOpen(false);
      toast({ title: "Product updated" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteConfirm(null);
      toast({ title: "Product deleted" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      currency: product.currency,
      image: product.image,
      hoverImage: product.hoverImage || "",
      gallery: product.gallery || [],
      color: product.color || "",
      sku: product.sku || "",
      fabric: product.fabric || "",
      pieces: product.pieces || "",
      collectionId: product.collectionId || "",
      isNew: product.isNew || false,
      isFeatured: product.isFeatured || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      price: parseInt(form.price),
      collectionId: form.collectionId || null,
      hoverImage: form.hoverImage || null,
      gallery: form.gallery.length > 0 ? form.gallery : null,
      color: form.color || null,
      sku: form.sku || null,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

  if (isLoading) {
    return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /><div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 bg-gray-200 rounded" />)}</div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">Products</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">{products.length} products</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-lg">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-400">No products yet. Add your first product.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div key={product.id} className="p-4 px-6 flex items-center gap-4">
                <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                  {product.image && !product.image.startsWith("/images/") ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium truncate">{product.name}</p>
                  <p className="font-sans text-xs text-gray-500">
                    {product.sku && <span className="mr-2">SKU: {product.sku}</span>}
                    {product.fabric} {product.pieces && `· ${product.pieces}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {product.isNew && <span className="px-2 py-0.5 text-[10px] tracking-wide uppercase bg-blue-50 text-blue-600 rounded">New</span>}
                  {product.isFeatured && <span className="px-2 py-0.5 text-[10px] tracking-wide uppercase bg-amber-50 text-amber-600 rounded">Featured</span>}
                </div>
                <p className="font-sans text-sm font-medium w-28 text-right">{formatPrice(product.price)}</p>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(product)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteConfirm(product.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Name *</Label>
                <Input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : generateSlug(e.target.value) })); }} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">SKU</Label>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. ZS-26-E1" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Price (PKR) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Color</Label>
                <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="e.g. Pink and Maroon" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Fabric</Label>
                <Input value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} placeholder="e.g. Korean Silk" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Pieces</Label>
                <Input value={form.pieces} onChange={e => setForm(f => ({ ...f, pieces: e.target.value }))} placeholder="e.g. 3pc" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Collection</Label>
                <Select value={form.collectionId} onValueChange={v => setForm(f => ({ ...f, collectionId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Product details, model height, shirt length..." />
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide">Main Product Image *</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "image");
                  e.target.value = "";
                }}
              />
              {form.image ? (
                <div className="relative inline-block">
                  <img src={form.image} alt="Product" className="w-28 h-36 object-cover rounded border" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setForm(f => ({ ...f, image: "" }))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 w-full h-24 border-dashed"
                  disabled={uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5" />
                  {uploadingImage ? "Uploading..." : "Upload Main Image"}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide">Gallery Images (Multiple)</Label>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleGalleryUpload(e.target.files);
                  }
                  e.target.value = "";
                }}
              />
              {form.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.gallery.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-20 h-24 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[9px] px-1 rounded">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="gap-2 w-full h-16 border-dashed"
                disabled={uploadingGallery}
                onClick={() => galleryInputRef.current?.click()}
              >
                <ImagePlus className="w-5 h-5" />
                {uploadingGallery ? "Uploading..." : `Add Gallery Images${form.gallery.length > 0 ? ` (${form.gallery.length} added)` : ""}`}
              </Button>
              <p className="text-[11px] text-gray-400">Upload multiple images for the product gallery. These appear as thumbnails on the product detail page.</p>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} className="rounded" />
                <span className="font-sans text-sm">Mark as New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="rounded" />
                <span className="font-sans text-sm">Featured</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-gray-600 mt-2">Are you sure you want to delete this product? This action cannot be undone.</p>
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
