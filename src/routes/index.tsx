import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Store | Shop the latest products" },
      {
        name: "description",
        content: "Discover our curated collection of products.",
      },
      {
        property: "og:title",
        content: "Store | Shop the latest products",
      },
      {
        property: "og:description",
        content: "Discover our curated collection of products.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(20)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-muted/50 px-6 py-16 text-center sm:px-12 lg:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome to the Store
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Discover our curated collection of products.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>

          {loading ? (
            <div className="mt-8 flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="mt-8 rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 rounded-lg border border-border bg-card p-12 text-center">
              <h3 className="text-xl font-semibold text-card-foreground">
                No products found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Your store doesn't have any products yet. Tell me what product
                you'd like to add and its price, and I'll create it for you.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
