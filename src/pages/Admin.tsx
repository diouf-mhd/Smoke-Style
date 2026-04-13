import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Package, Edit2, X } from "lucide-react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // Préparer la modification
  function startEdit(product: any) {
    setIsEditing(true);
    setEditId(product.id);
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category || '',
      stock: product.stock.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte au formulaire
  }

  // Annuler la modification
  function cancelEdit() {
    setIsEditing(false);
    setEditId(null);
    setForm({ name: '', price: '', category: '', stock: '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isEditing && editId) {
      // MODE MODIFICATION
      const { error } = await supabase
        .from('products')
        .update({ 
          name: form.name, 
          price: Number(form.price), 
          category: form.category, 
          stock: Number(form.stock) 
        })
        .eq('id', editId);
      
      if (!error) cancelEdit();
    } else {
      // MODE AJOUT
      await supabase.from('products').insert([
        { name: form.name, price: Number(form.price), category: form.category, stock: Number(form.stock) }
      ]);
      setForm({ name: '', price: '', category: '', stock: '' });
    }
    fetchProducts();
  }

  async function deleteProduct(id: string) {
    if(confirm("Supprimer définitivement ?")) {
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-orange-500 text-center md:text-left">Smoke & Style Admin</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* FORMULAIRE (Ajout ou Modif) */}
          <Card className="bg-zinc-900 border-zinc-800 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEditing ? <Edit2 className="w-5 h-5 text-blue-400" /> : <PlusCircle className="w-5 h-5 text-orange-500" />}
                {isEditing ? "Modifier le produit" : "Nouveau Produit"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                <Input type="number" placeholder="Prix" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                <Input placeholder="Catégorie" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                <Input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                
                <div className="flex gap-2">
                    <Button type="submit" className={`flex-1 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                    {isEditing ? "Mettre à jour" : "Publier"}
                    </Button>
                    {isEditing && (
                        <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-700">
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* TABLEAU */}
          <Card className="bg-zinc-900 border-zinc-800 col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Inventaire</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead>Produit</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p.id} className="border-zinc-800">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.price} F</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(p)} className="hover:text-blue-400">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
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