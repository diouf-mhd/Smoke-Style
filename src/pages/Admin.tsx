import { useState, useEffect } from 'react';
// Correction de l'import : on utilise le chemin relatif direct
import { supabase } from '../lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Package, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Erreur de chargement:", error);
    if (data) setProducts(data);
    setLoading(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Remplis au moins le nom et le prix !");

    const { error } = await supabase.from('products').insert([
      { 
        name: form.name, 
        price: Number(form.price), 
        category: form.category, 
        stock: Number(form.stock) 
      }
    ]);
    
    if (!error) {
      setForm({ name: '', price: '', category: '', stock: '' });
      fetchProducts();
    } else {
      alert("Erreur lors de l'ajout : " + error.message);
    }
  }

  async function deleteProduct(id: string) {
    if (confirm("Supprimer ce produit ?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-orange-500">Smoke & Style</h1>
            <p className="text-zinc-400">Gestion de l'inventaire</p>
          </div>
          <Button variant="ghost" className="text-zinc-400 hover:text-red-400" onClick={() => supabase.auth.signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* FORMULAIRE */}
          <Card className="bg-zinc-900 border-zinc-800 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <PlusCircle className="w-5 h-5 text-orange-500" /> Ajouter un article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Nom du produit</label>
                  <Input 
                    placeholder="ex: Puff Mylo Myrtille" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Prix (FCFA)</label>
                  <Input 
                    type="number" 
                    placeholder="5000" 
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Catégorie</label>
                  <Input 
                    placeholder="Puff, Chicha, Bonnet..." 
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Quantité en stock</label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white" 
                  />
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6">
                  Mettre en vente
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* LISTE */}
          <Card className="bg-zinc-900 border-zinc-800 col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Package className="w-5 h-5 text-orange-500" /> Stock actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-10 text-zinc-500">Chargement des produits...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Produit</TableHead>
                      <TableHead className="text-zinc-400">Catégorie</TableHead>
                      <TableHead className="text-zinc-400">Prix</TableHead>
                      <TableHead className="text-zinc-400 text-center">Stock</TableHead>
                      <TableHead className="text-zinc-400 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-zinc-600">Aucun produit en vente.</TableCell>
                      </TableRow>
                    ) : (
                      products.map((product: any) => (
                        <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                          <TableCell className="font-medium text-zinc-200">{product.name}</TableCell>
                          <TableCell className="text-zinc-400">{product.category}</TableCell>
                          <TableCell className="text-orange-400 font-semibold">{product.price.toLocaleString()} F</TableCell>
                          <TableCell className="text-center">
                             <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                               {product.stock}
                             </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="hover:bg-red-900/20">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}