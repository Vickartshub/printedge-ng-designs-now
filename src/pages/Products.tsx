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

      {/* Dummy Banner Slot */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-24 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Banner Slot</span>
        </div>
      </div>

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
                      <div className="mt-2">
                        <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-primary">
                        ₦{calculatePrice(product).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

              <CardContent className="space-y-4">
                {/* Design Upload/Create Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>

                {/* Specifications Dropdown */}
                {productSpecifications[product.id as keyof typeof productSpecifications] && (
                  <div>
                    <Label className="text-sm font-semibold">Add Specifications</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between mt-2">
                          Select specifications
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {productSpecifications[product.id as keyof typeof productSpecifications].map((spec) => (
                          <DropdownMenuItem
                            key={spec.name}
                            onClick={() => toggleSpec(product.id, spec.name)}
                          >
                            <span>{spec.name} (+₦{spec.price.toLocaleString()})</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* Size Options for T-shirts */}
                {product.name === "Branded T-shirt" && (
                  <div>
                    <Label className="text-base font-semibold">Size Options</Label>
                    <div className="grid gap-2 mt-2">
                      {productSpecifications["branded-tshirt"].map((size) => (
                        <div key={size.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`size-${product.id}`}
                              checked={selectedSizes[product.id] === size.name}
                              onChange={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size.name }))}
                            />
                            <span>{size.name}</span>
                          </div>
                          <span className="font-semibold text-primary">+₦{size.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Dimensions for Banner */}
                {product.name === "Banner" && (
                  <div>
                    <Label className="text-base font-semibold">Dimensions (Feet)</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor={`width-${product.id}`}>Width (ft)</Label>
                        <Input
                          id={`width-${product.id}`}
                          type="number"
                          min="1"
                          placeholder="Width"
                          value={dimensions[product.id]?.width || ''}
                          onChange={(e) => updateDimension(product.id, 'width', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`height-${product.id}`}>Height (ft)</Label>
                        <Input
                          id={`height-${product.id}`}
                          type="number"
                          min="1"
                          placeholder="Height"
                          value={dimensions[product.id]?.height || ''}
                          onChange={(e) => updateDimension(product.id, 'height', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cost: ₦300 per square foot
                    </p>
                  </div>
                )}

                {/* Unit Options for Flyers */}
                {product.name === "Flyers & Brochure" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Size Options</Label>
                      <div className="grid gap-2 mt-2">
                        {[
                          { unit: "A4 Flyer", price: 150 },
                          { unit: "A5 Flyer", price: 80 },
                          { unit: "A6 Flyer", price: 50 }
                        ].map((unit) => (
                          <div key={unit.unit} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`unit-${product.id}`}
                                checked={selectedUnits[product.id] === unit.unit}
                                onChange={() => setSelectedUnits(prev => ({ ...prev, [product.id]: unit.unit }))}
                              />
                              <span>{unit.unit}</span>
                            </div>
                            <span className="font-semibold text-primary">₦{unit.price}/pc</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedUnits[product.id] && (
                      <div>
                        <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            id={`quantity-${product.id}`}
                            type="number"
                            min="1"
                            value={quantities[product.id] || 1}
                            onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                            className="w-24 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tier Options for Wedding Invitations */}
                {product.name === "Wedding Invitations" && (
                  <div>
                    <Label className="text-base font-semibold">Package Options</Label>
                    <div className="grid gap-2 mt-2">
                      {[
                        { tier: "Luxury Card", price: 100000, description: "100pcs - Premium materials with gold foiling" },
                        { tier: "Middle Class Card", price: 60000, description: "100pcs - High-quality printing on premium paper" }
                      ].map((tier) => (
                        <div key={tier.tier} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name={`tier-${product.id}`}
                                checked={selectedTiers[product.id] === tier.tier}
                                onChange={() => setSelectedTiers(prev => ({ ...prev, [product.id]: tier.tier }))}
                                className="mt-1"
                              />
                              <div>
                                <span className="font-semibold">{tier.tier}</span>
                                <p className="text-sm text-muted-foreground">{tier.description}</p>
                              </div>
                            </div>
                            <span className="font-bold text-primary">₦{tier.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button className="w-full" size="sm" onClick={() => handleAddToCart(product)}>
                  Add to Cart - ₦{calculatePrice(product).toLocaleString()}
                </Button>
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