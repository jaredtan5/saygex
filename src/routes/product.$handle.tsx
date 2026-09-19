import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle, formatMoney } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/shopify";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const product = await fetchProductByHandle(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.product.title} | Store` },
      {
        name: "description",
        content:
          loaderData.product.description ||
          `Buy ${loaderData.product.title} from our store`,
      },
      {
        property: "og:title",
        content: `${loaderData.product.title} | Store`,
      },
      {
        property: "og:description",
        content:
          loaderData.product.description ||
          `Buy ${loaderData.product.title} from our store`,
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: loaderData.product.images.edges[0]?.node.url,
      },
      {
        property: "og:image",
        content: loaderData.product.images.edges[0]?.node.url,
      },
    ],
  }),
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn't find the product you're looking for.
        </p>
      </div>
    </div>
  ),
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData() as { product: ShopifyProduct["node"] };
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  const variants = product.variants.edges.map((edge) => edge.node);
  const hasVariants = variants.length > 1 || product.options.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);

  const images = product.images.edges.map((edge) => edge.node);
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.altText ?? product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded-md border bg-muted ${
                      selectedImage?.url === image.url
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText ?? product.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-4 text-2xl font-semibold">
              {formatMoney(
                selectedVariant?.price.amount ??
                  product.priceRange.minVariantPrice.amount,
                selectedVariant?.price.currencyCode ??
                  product.priceRange.minVariantPrice.currencyCode
              )}
            </p>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {product.description || "No description available."}
            </p>

            {hasVariants && (
              <div className="mt-8 space-y-4">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="text-sm font-medium">{option.name}</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = selectedVariant?.selectedOptions.some(
                          (opt) => opt.name === option.name && opt.value === value
                        );
                        const matchingVariant = variants.find((variant) =>
                          variant.selectedOptions.every(
                            (opt) =>
                              opt.name === option.name
                                ? opt.value === value
                                : selectedVariant?.selectedOptions.some(
                                    (s) =>
                                      s.name === opt.name &&
                                      s.value === opt.value
                                  )
                          )
                        );
                        return (
                          <Button
                            key={value}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={!matchingVariant?.availableForSale}
                            onClick={() => {
                              if (matchingVariant) {
                                setSelectedVariant(matchingVariant);
                              }
                            }}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-8" />

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="flex-1"
                    size="lg"
                    disabled={
                      isLoading || !selectedVariant?.availableForSale
                    }
                    onClick={handleAddToCart}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
                {!selectedVariant?.availableForSale && (
                  <Badge variant="secondary" className="mt-4 w-full justify-center">
                    Out of stock
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
