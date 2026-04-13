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
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Corrigé ici
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // --- CORRECTION UPLOAD DEFINITIVE ---
 function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  if (e.target.files && e.target.files) {
    // On passe par 'unknown' pour que TS arrête de poser des questions
    const file = e.target.files as unknown as File; 
    
    setImageFile(file); 
    setImagePreview(URL.createObjectURL(file)); 
  }
}

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
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

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-zinc-700 pb-6">
          <div>
            <h1 className="text-4xl font-black text-orange-500 tracking-tighter">SMOKE & STYLE</h1>
            <p className="text-zinc-400 font-medium">Gestion du Stock</p>
          </div>
          <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white" onClick={() => supabase.auth.signOut()}>
             Quitter
          </Button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FORMULAIRE - BORDURES PLUS VISIBLES */}
          <Card className="bg-zinc-900 border-zinc-600 shadow-xl">
            <CardHeader className="border-b border-zinc-800 mb-4">
              <CardTitle className="text-white flex items-center gap-2">
                {isEditing ? <Edit2 className="text-blue-400" /> : <PlusCircle className="text-orange-500" />}
                {isEditing ? "Modifier" : "Ajouter un article"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ZONE UPLOAD CORRIGÉE */}
                <div 
                  className="border-2 border-dashed border-zinc-400 rounded-xl p-6 text-center bg-zinc-800 hover:border-orange-500 cursor-pointer transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="mx-auto h-32 w-32 object-contain rounded-lg shadow-lg" />
                  ) : (
                    <div className="py-4">
                        <UploadCloud className="w-12 h-12 mx-auto text-zinc-400 mb-2" />
                        <p className="text-sm text-zinc-300 font-bold">CLIQUE ICI POUR LA PHOTO</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>

                <div className="space-y-4">
                    <Input placeholder="Nom du produit" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-zinc-800 border-zinc-500 text-white h-12 placeholder:text-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" placeholder="Prix (F)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-zinc-800 border-zinc-500 text-white h-12 placeholder:text-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required />
                        <Input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-zinc-800 border-zinc-500 text-white h-12 placeholder:text-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" required />
                    </div>
                    <Input placeholder="Catégorie (Puff, Chicha...)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-zinc-800 border-zinc-500 text-white h-12 placeholder:text-zinc-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                
                <Button type="submit" disabled={loading} className={`w-full h-12 text-lg font-bold ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                  {loading ? "Chargement..." : isEditing ? "METTRE À JOUR" : "PUBLIER L'ARTICLE"}
                </Button>
                
                {isEditing && (
                  <Button type="button" onClick={resetForm} className="w-full bg-transparent border border-zinc-500 text-zinc-400">
                    Annuler la modification
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* LISTE DES PRODUITS */}
          <Card className="bg-zinc-900 border-zinc-600 lg:col-span-2 overflow-hidden shadow-xl">
            <CardHeader className="bg-zinc-800 border-b border-zinc-700">
              <CardTitle className="text-white">Inventaire Actuel</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700 bg-zinc-800/50">
                    <TableHead className="text-zinc-300">Photo</TableHead>
                    <TableHead className="text-zinc-300">Nom</TableHead>
                    <TableHead className="text-zinc-300">Prix</TableHead>
                    <TableHead className="text-zinc-300">Stock</TableHead>
                    <TableHead className="text-right text-zinc-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p.id} className="border-zinc-800 hover:bg-zinc-800/40">
                      <TableCell>
                        <img src={p.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover rounded bg-black border border-zinc-700" />
                      </TableCell>
                      <TableCell className="font-bold text-zinc-100">{p.name}</TableCell>
                      <TableCell className="text-orange-400 font-bold">{p.price} F</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${p.stock > 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                          {p.stock} pcs
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => startEdit(p)} className="bg-blue-900/50 text-blue-400 hover:bg-blue-400 hover:text-white">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => { if(confirm("Supprimer ?")) supabase.from('products').delete().eq('id', p.id).then(() => fetchProducts()) }} className="bg-red-900/50 text-red-400 hover:bg-red-500 hover:text-white">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
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