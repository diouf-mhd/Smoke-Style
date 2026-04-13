import { useState } from "react";
import { useProducts, useDeliveryZones } from "@/hooks/useProducts";
import { useIsAdmin, useUpdateProduct, useCreateProduct, useDeleteProduct } from "@/hooks/useAdmin";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ProductCategory = Database["public"]["Enums"]["product_category"];

const AdminPage = () => {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const [addOpen, setAddOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "puff" as ProductCategory,
    price: 0,
    flavor: "",
    description: "",
    customizable: false,
    custom_price_extra: 0,
  });

  if (adminLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Chargement...</p></div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  const handleToggleStock = (id: string, currentStock: boolean) => {
    updateProduct.mutate({ id, in_stock: !currentStock }, {
      onSuccess: () => toast.success("Stock mis à jour"),
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer "${name}" ?`)) {
      deleteProduct.mutate(id, { onSuccess: () => toast.success("Produit supprimé") });
    }
  };

  const handleAdd = () => {
    createProduct.mutate(
      {
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        flavor: newProduct.flavor || null,
        description: newProduct.description || null,
        customizable: newProduct.customizable,
        custom_price_extra: newProduct.custom_price_extra,
      },
      {
        onSuccess: () => {
          toast.success("Produit ajouté");
          setAddOpen(false);
          setNewProduct({ name: "", category: "puff", price: 0, flavor: "", description: "", customizable: false, custom_price_extra: 0 });
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const grouped = {
    puff: products?.filter((p) => p.category === "puff") ?? [],
    chicha: products?.filter((p) => p.category === "chicha") ?? [],
    bonnet: products?.filter((p) => p.category === "bonnet") ?? [],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" /> Administration
            </h1>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v as ProductCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="puff">Puff</SelectItem>
                        <SelectItem value="chicha">Chicha</SelectItem>
                        <SelectItem value="bonnet">Bonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix (F CFA)</Label>
                    <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Saveur / Parfum</Label>
                    <Input value={newProduct.flavor} onChange={(e) => setNewProduct({ ...newProduct, flavor: e.target.value })} placeholder="Optionnel" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newProduct.customizable} onCheckedChange={(c) => setNewProduct({ ...newProduct, customizable: c })} />
                    <Label>Personnalisable</Label>
                  </div>
                  {newProduct.customizable && (
                    <div className="space-y-2">
                      <Label>Supplément personnalisation (F)</Label>
                      <Input type="number" value={newProduct.custom_price_extra} onChange={(e) => setNewProduct({ ...newProduct, custom_price_extra: Number(e.target.value) })} />
                    </div>
                  )}
                  <Button onClick={handleAdd} className="w-full" disabled={!newProduct.name || newProduct.price <= 0}>
                    Créer le produit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(["puff", "chicha", "bonnet"] as const).map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-display font-semibold mb-4 capitalize">
                {cat === "puff" ? "💨 Puffs" : cat === "chicha" ? "🪈 Chichas" : "🧢 Bonnets"}
              </h2>
              <div className="space-y-2">
                {grouped[cat].map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{p.name}</span>
                        {p.flavor && <Badge variant="secondary">{p.flavor}</Badge>}
                        {!p.in_stock && <Badge variant="destructive">Épuisé</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">{p.price.toLocaleString()} F</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.in_stock}
                          onCheckedChange={() => handleToggleStock(p.id, p.in_stock)}
                        />
                        <span className="text-xs text-muted-foreground">Stock</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.name)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {grouped[cat].length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">Aucun produit dans cette catégorie.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
