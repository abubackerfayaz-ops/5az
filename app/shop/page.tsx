import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

async function getProducts(params: any) {
    try {
        await dbConnect();

        const query: any = {};

        if (params?.category) query.category = params.category;
        if (params?.league) query.league = params.league;
        if (params?.team) query.team = params.team;
        if (params?.search) {
            query.name = { $regex: new RegExp(params.search, 'i') };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return products;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

export default async function ShopPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; league?: string; team?: string; search?: string }>
}) {
    const params = await searchParams;
    const products = await getProducts(params);

    return (
        <main className="min-h-screen pt-16">
            <Navbar />

            {/* Header */}
            <div className="bg-black border-b border-white/10 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white mb-4">
                        All <span className="text-neon-pink">Jerseys</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl">
                        Browse our collection of premium football jerseys. From the latest season drops to retro classics.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2 text-neon-blue">League</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?league=Premier+League">Premier League</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?league=La+Liga">La Liga</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?league=International">International</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2 text-neon-pink">Team</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?team=Real+Madrid">Real Madrid</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?team=Barcelona">Barcelona</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?team=Manchester+City">Man City</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?team=Arsenal">Arsenal</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?team=Liverpool">Liverpool</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?team=France">France</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Category</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop?category=Season+25-26">Season 25/26</a></li>
                            <li className="hover:text-white cursor-pointer transition-colors"><a href="/shop">All</a></li>
                        </ul>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length > 0 ? (
                            products.map((product: any) => (
                                <ProductCard
                                    key={product._id.toString()}
                                    id={product._id.toString()}
                                    name={product.name}
                                    price={product.price}
                                    originalPrice={product.originalPrice}
                                    image={product.images[0]}
                                    category={product.category}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                <p className="text-xl font-bold mb-2">No kits found.</p>
                                <p>Try adjusting your search filters.</p>
                                <a href="/shop" className="inline-block mt-4 text-neon-blue hover:underline">Clear Filters</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
