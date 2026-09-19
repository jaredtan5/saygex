import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  const defaultVariant = product.node.variants.edges[0]?.node;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    await addItem({
      product,
      variantId: defaultVariant.id,
      variantTitle: defaultVariant.title,
      price: defaultVariant.price,
      quantity: 1,
      selectedOptions: defaultVariant.selectedOptions,
    });
  };

  const image = product.node.images.edges[0]?.node;

  return (
    <Card className="group overflow-hidden border-border bg-card">
      <Link to="/product/$handle" params={{ handle: product.node.handle }}>
        <div className="aspect-square overflow-hidden bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.node.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link
          to="/product/$handle"
          params={{ handle: product.node.handle }}
          className="block"
        >
          <h3 className="font-semibold text-card-foreground line-clamp-1">
            {product.node.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.node.description || "No description"}
          </p>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold">
            {formatMoney(
              product.node.priceRange.minVariantPrice.amount,
              product.node.priceRange.minVariantPrice.currencyCode
            )}
          </span>
          <Button
            size="sm"
            disabled={isLoading || !defaultVariant?.availableForSale}
            onClick={handleAddToCart}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add to Cart"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
