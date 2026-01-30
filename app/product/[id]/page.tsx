
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import ProductActions from "@/components/ProductActions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProduct(id: string) {
    try {
        await dbConnect();
        const product = await Product.findById(id);
        if (!product) return null;
        return product;
    } catch (e) {
        return null;
    }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-16">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link href="/shop" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2 text-neon-blue font-bold tracking-wider uppercase">{product.category}</div>
                        <h1 className="text-3xl md:text-5xl font-black italic mb-4">{product.name}</h1>

                        <ProductActions
                            id={product._id.toString()}
                            name={product.name}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            image={product.images[0]}
                            sizes={product.sizes}
                            inStock={product.inStock}
                        />

                        <p className="text-gray-300 leading-relaxed mb-8 border-b border-white/10 pb-8 mt-8">
                            {product.description}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

