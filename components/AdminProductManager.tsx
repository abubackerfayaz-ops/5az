'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash, Plus, Package, Save, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface Product {
    _id?: string;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    team: string;
    stock: number;
    isActive: boolean;
    description: string;
}

export default function AdminProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products/list');
            const data = await res.json();
            if (data.status === 'success') {
                // Map the short structure back to our interface for display
                // Note: The real update would require full product data
                setProducts(data.products.map((p: any) => ({
                    ...p,
                    price: parseInt(p.price.toString().replace(/[^\d]/g, '')),
                    isActive: true,
                })));
            } else {
                setError(data.error || 'Failed to fetch products');
            }
        } catch (err) {
            setError('Error connecting to API');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        setActionLoading(true);
        try {
            // In a real app, this would be a DELETE request to /api/products/[id]
            // For now, we simulate success if DB is down or log error
            const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.slug !== slug));
            } else {
                const data = await res.json();
                alert(data.error || 'Delete failed (DB might be disconnected)');
            }
        } catch (err) {
            alert('Error deleting product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct && !isAdding) return;

        setActionLoading(true);
        try {
            const productToSave = editingProduct || {} as Product;
            const method = isAdding ? 'POST' : 'PUT';
            const url = isAdding ? '/api/products' : `/api/products/${productToSave._id || productToSave.slug}`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productToSave),
            });

            if (res.ok) {
                await fetchProducts();
                setIsAdding(false);
                setEditingProduct(null);
            } else {
                const data = await res.json();
                alert(data.error || 'Save failed');
            }
        } catch (err) {
            alert('Error saving product');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center p-20">
            <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic">INVENTORY</h2>
                <button
                    onClick={() => { setIsAdding(true); setEditingProduct({ name: '', price: 0, category: 'Jerseys', images: [''], team: '', stock: 10, isActive: true, slug: '', description: '' } as any); }}
                    className="bg-neon-green text-black font-black uppercase px-4 py-2 rounded flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded mb-6 text-sm font-bold">
                    WARNING: {error}. Check your MongoDB connection strings in .env.local
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-black italic uppercase text-xs tracking-widest text-gray-400">Product</th>
                                <th className="p-4 font-black italic uppercase text-xs tracking-widest text-gray-400">Category</th>
                                <th className="p-4 font-black italic uppercase text-xs tracking-widest text-gray-400">Price</th>
                                <th className="p-4 font-black italic uppercase text-xs tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.slug} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 opacity-20" /></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.team}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded inline-block ${product.category === 'Retro' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50' :
                                            product.category === 'New Drops' ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' :
                                                'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                                            }`}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-black italic">₹{product.price}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingProduct(product)}
                                                className="p-2 hover:bg-white/10 rounded title='Edit'"
                                            >
                                                <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.slug)}
                                                className="p-2 hover:bg-red-500/20 rounded title='Delete'"
                                            >
                                                <Trash className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Edit/Add */}
            {(editingProduct || isAdding) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setEditingProduct(null); setIsAdding(false); }}></div>
                    <div className="relative bg-black border border-white/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-black italic uppercase">
                                {isAdding ? 'Add New product' : 'Edit Product'}
                            </h3>
                            <button onClick={() => { setEditingProduct(null); setIsAdding(false); }} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-500">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm focus:border-neon-pink transition-colors outline-none"
                                        value={editingProduct?.name || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500">Price (INR)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm focus:border-neon-blue transition-colors outline-none"
                                        value={editingProduct?.price || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct!, price: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500">Category</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm outline-none"
                                        value={editingProduct?.category || 'Jerseys'}
                                        onChange={e => setEditingProduct({ ...editingProduct!, category: e.target.value })}
                                    >
                                        <option value="Jerseys">Jerseys</option>
                                        <option value="Retro">Retro</option>
                                        <option value="New Drops">New Drops</option>
                                        <option value="Special Edition">Special Edition</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500">Team</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm outline-none"
                                        value={editingProduct?.team || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct!, team: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-500">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm outline-none"
                                        value={editingProduct?.stock || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-500">Description</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm min-h-[100px] outline-none"
                                    value={editingProduct?.description || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct!, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-500">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm outline-none"
                                    value={editingProduct?.images?.[0] || ''}
                                    onChange={e => {
                                        const imgs = [...(editingProduct?.images || [])];
                                        imgs[0] = e.target.value;
                                        setEditingProduct({ ...editingProduct!, images: imgs });
                                    }}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 bg-neon-pink text-white font-black uppercase py-4 rounded hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isAdding ? 'Create Product' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setEditingProduct(null); setIsAdding(false); }}
                                    className="px-6 bg-white/10 text-white font-black uppercase py-4 rounded hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
