import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Package, Edit2, X, UploadCloud, ImageIcon, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files) {
      const file = e.target.files;
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let currentImageUrl = form.image_url;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) currentImageUrl = uploadedUrl;
    }
    
    const productData = { 
        name: form.name, 
        price: Number(form.price), 
        category: form.category, 
        stock: Number(form.stock),
        image_url: currentImageUrl 
    };

    if (isEditing && editId) {
      await supabase.from('products').update(productData).eq('id', editId);
    } else {
      await supabase.from('products').insert([productData]);
    }

    resetForm();
    fetchProducts();
  }

  function resetForm() {
    setIsEditing(false);
    setEditId(null);
    setForm({ name: '', price: '', category: '', stock: '', image_url: '' });
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(false);
  }

  function startEdit(product: any) {
    setIsEditing(true);
    setEditId(product.id);
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category || '',
      stock: product.stock.toString(),
      image_url: product.image_url || ''
    });
    setImagePreview(product.image_url || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteProduct(id: string) {
    if(confirm("Supprimer ce produit ?")) {
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Smoke & Style</h1>
            <p className="text-zinc-400 text-sm italic">Panneau d'administration</p>
          </div>
          <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => supabase.auth.signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Quitter
          </Button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FORMULAIRE */}
          <Card className="bg-zinc-900 border-zinc-800 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                {isEditing ? <Edit2 className="w-5 h-5 text-blue-400" /> : <PlusCircle className="w-5 h-5 text-orange-500" />}
                {isEditing ? "Modifier l'article" : "Nouvel Article"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                  className="border-2 border-dashed border-zinc-800 rounded-lg p-4 text-center bg-black/20 hover:border-orange-500/50 cursor-pointer transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="mx-auto h-24 w-24 object-cover rounded-md mb-2" />
                  ) : (
                    <UploadCloud className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                  )}
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Photo du produit</p>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>

                <Input placeholder="Nom du produit" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="Prix (F)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" required />
                  <Input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" required />
                </div>
                <Input placeholder="Catégorie (Puff, Chicha...)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" />
                
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className={`flex-1 ${isEditing ? 'bg-blue-600' : 'bg-orange-600'} text-white font-bold`}>
                    {loading ? "Chargement..." : isEditing ? "Mettre à jour" : "Publier"}
                  </Button>
                  {isEditing && (
                    <Button type="button" onClick={resetForm} variant="outline" className="border-zinc-700 text-zinc-400">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* LISTE DES PRODUITS */}
          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2 overflow-hidden">
            <CardHeader className="bg-zinc-800/30">
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Package className="w-5 h-5 text-orange-500" /> Stock et Inventaire
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-800/10">
                  <TableRow className="border-zinc-800">
                    <TableHead className="w-16">Photo</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p.id} className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                      <TableCell>
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded border border-zinc-800 bg-black" />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-zinc-600" /></div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-200">{p.name}</TableCell>
                      <TableCell className="text-orange-400 font-mono font-bold">{p.price} F</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock > 0 ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                          {p.stock} pcs
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
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