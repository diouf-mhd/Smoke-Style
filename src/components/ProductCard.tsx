import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const whatsappMessage = product.category === "bonnet" && product.customizable
    ? `Bonjour, je souhaite commander le ${product.name} personnalisé au prix de ${product.price} F. Texte à broder : `
    : `Bonjour, je souhaite commander ${product.name}${product.flavor ? ` Saveur ${product.flavor}` : ""} au prix de ${product.price} F`;

  const whatsappUrl = `https://wa.me/221XXXXXXXXX?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="gradient-smoke w-full h-full flex items-center justify-center">
            <span className="text-4xl font-display font-bold text-primary/30">
              {product.category === "puff" ? "💨" : product.category === "chicha" ? "🪈" : "🧢"}
            </span>
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Épuisé</Badge>
          </div>
        )}
        {product.customizable && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">Personnalisable</Badge>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-card-foreground">{product.name}</h3>
        {product.flavor && (
          <p className="text-sm text-muted-foreground">Saveur : {product.flavor}</p>
        )}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-display font-bold text-primary">{product.price.toLocaleString()} F</span>
            {product.customizable && product.custom_price_extra && (
              <span className="text-xs text-muted-foreground block">
                +{product.custom_price_extra.toLocaleString()} F broderie
              </span>
            )}
          </div>
          {product.in_stock && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Commander
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
