import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

interface CategoryPageProps {
  category: "puff" | "chicha" | "bonnet";
  title: string;
  subtitle: string;
  emoji: string;
}

export const CategoryPage = ({ category, title, subtitle, emoji }: CategoryPageProps) => {
  const { data: products, isLoading } = useProducts(category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-5xl mb-4 block">{emoji}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {products?.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Aucun produit disponible pour le moment.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
