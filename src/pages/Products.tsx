import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Upload, Palette, Plus, Minus, Search, ShoppingCart, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { FlashBanner } from "@/components/FlashBanner";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/contexts/AuthContext";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  button_text?: string;
  is_active: boolean;
  position: number;
}

interface ProductSpec {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  description: string;
  image_url?: string;
  category: string;
  is_active: boolean;
  specifications?: ProductSpec[];
  customDimensions?: boolean;
  sizeOptions?: { size: string; price: number }[];
  unitOptions?: { unit: string; price: number }[];
  tierOptions?: { tier: string; price: number; description: string }[];
}

// Specification mappings for different products
const productSpecifications = {
  "business-cards": [
    { name: "Curved edge", price: 1000 },
    { name: "600grams", price: 3000 },
    { name: "Express Delivery", price: 4000 }
  ],
  "branded-tshirt": [
    { name: "L, M, S", price: 2000 },
    { name: "XL", price: 3000 },
    { name: "XXL", price: 5000 }
  ],
  "mugs": [
    { name: "Magic Mug", price: 5000 }
  ]
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadProducts();
    loadBanners();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      if (data) {
        setBanners(data);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  };

  const toggleSpec = (productId: string, specName: string) => {
    setSelectedSpecs(prev => ({
      ...prev,
      [productId]: prev[productId]?.includes(specName)
        ? prev[productId].filter(s => s !== specName)
        : [...(prev[productId] || []), specName]
    }));
  };

  const updateDimension = (productId: string, dimension: 'width' | 'height', value: number) => {
    setDimensions(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [dimension]: value
      }
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const calculatePrice = (product: Product) => {
    let total = product.base_price;
    const productId = product.id;
    const specs = productSpecifications[productId as keyof typeof productSpecifications];

    // Add specification costs
    if (specs && selectedSpecs[productId]) {
      selectedSpecs[productId].forEach(specName => {
        const spec = specs.find(s => s.name === specName);
        if (spec) total += spec.price;
      });
    }

    // Calculate banner price based on dimensions
    if (product.name === "Banner" && dimensions[productId]) {
      const { width, height } = dimensions[productId];
      if (width && height) {
        total = width * height * 300;
      }
    }

    // Calculate flyer price with quantity
    if (product.name === "Flyers & Brochure" && selectedUnits[productId] && quantities[productId]) {
      const unitPrices = {
        "A4 Flyer": 150,
        "A5 Flyer": 80,
        "A6 Flyer": 50
      };
      const unitPrice = unitPrices[selectedUnits[productId] as keyof typeof unitPrices];
      if (unitPrice) {
        total = unitPrice * quantities[productId];
      }
    }

    // Set tier pricing for wedding invitations
    if (product.name === "Wedding Invitations" && selectedTiers[productId]) {
      const tierPrices = {
        "Luxury Card": 100000,
        "Middle Class Card": 60000
      };
      const tierPrice = tierPrices[selectedTiers[productId] as keyof typeof tierPrices];
      if (tierPrice) total = tierPrice;
    }

    return total;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const specs = selectedSpecs[product.id] || [];
      const customDims = dimensions[product.id] || null;
      const unitPrice = calculatePrice(product);
      const quantity = quantities[product.id] || 1;

      await addToCart({
        product_id: product.id,
        quantity,
        selected_specs: specs,
        custom_dimensions: customDims,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        product_name: product.name,
        product_description: product.description,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Flash Banner */}
      <FlashBanner />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Our Products</h1>
                <p className="text-muted-foreground">Choose from our wide range of printing and branding services</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <CartDrawer />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Banner Section */}
      {banners.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          {banners.map((banner) => (
            <div key={banner.id} className="relative overflow-hidden rounded-lg mb-4">
              {banner.image_url ? (
                <div className="relative h-48 md:h-64 lg:h-80">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white px-6">
                      <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                      {banner.subtitle && (
                        <p className="text-lg md:text-xl mb-3 opacity-90">{banner.subtitle}</p>
                      )}
                      {banner.description && (
                        <p className="text-sm md:text-base mb-4 opacity-80 max-w-2xl mx-auto">{banner.description}</p>
                      )}
                      {banner.link_url && (
                        <Link to={banner.link_url}>
                          <Button size="lg" className="bg-primary hover:bg-primary/90">
                            {banner.button_text || 'Learn More'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 md:h-64 lg:h-80 bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center">
                  <div className="text-center px-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{banner.title}</h2>
                    {banner.subtitle && (
                      <p className="text-lg md:text-xl mb-3 text-muted-foreground">{banner.subtitle}</p>
                    )}
                    {banner.description && (
                      <p className="text-sm md:text-base mb-4 text-muted-foreground max-w-2xl mx-auto">{banner.description}</p>
                    )}
                    {banner.link_url && (
                      <Link to={banner.link_url}>
                        <Button size="lg">
                          {banner.button_text || 'Learn More'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search and Categories on Same Line */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getCategories().map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Product Image
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.description}</CardDescription>
                      {/* Category hidden as per request */}
                    </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-primary">
                          <sup className="text-xs font-normal text-muted-foreground mr-1">Starting from </sup>
                          ₦{calculatePrice(product).toLocaleString()}
                        </p>
                      </div>
                  </div>
                </CardHeader>

              <CardContent>
                <Link to={`/products/${product.id}`}>
                  <Button className="w-full" size="sm">Order Now</Button>
                </Link>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;