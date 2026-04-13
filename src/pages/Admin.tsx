import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Package } from "lucide-react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '' });

  // 1. Récupérer les produits
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // 2. Ajouter un produit
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([
      { name: form.name, price: Number(form.price), category: form.category, stock: Number(form.stock) }
    ]);
    
    if (!error) {
      setForm({ name: '', price: '', category: '', stock: '' });
      fetchProducts();
    }
  }

  // 3. Supprimer un produit
  async function deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">Smoke & Style Admin</h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Déconnexion</Button>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulaire d'ajout */}
          <Card className="bg-zinc-900 border-zinc-800 col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Nouveau Produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <Input 
                  placeholder="Nom (ex: Puff Mylo)" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-700" 
                />
                <Input 
                  type="number" 
                  placeholder="Prix (FCFA)" 
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="bg-zinc-800 border-zinc-700" 
                />
                <Input 
                  placeholder="Catégorie (Puff, Chicha, Bonnet)" 
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="bg-zinc-800 border-zinc-700" 
                />
                <Input 
                  type="number" 
                  placeholder="Stock" 
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                  className="bg-zinc-800 border-zinc-700" 
                />
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                  Publier sur le site
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Liste des produits */}
          <Card className="bg-zinc-900 border-zinc-800 col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" /> Inventaire Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id} className="border-zinc-800">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price} F</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}