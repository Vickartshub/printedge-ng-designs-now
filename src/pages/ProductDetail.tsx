import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  base_price: number;
  description: string;
  image_url?: string;
  category?: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setProduct(data as Product);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const title = product ? `${product.name} | Product Details` : "Product Details";
    document.title = title;
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = product?.description ? product.description.slice(0, 150) : "View product details";
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={`${product.name} product image`}
            className="w-full max-w-3xl rounded-lg shadow-sm mb-6"
            loading="lazy"
          />
        )}

        <section className="max-w-3xl">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-foreground/90">{product.description}</p>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
