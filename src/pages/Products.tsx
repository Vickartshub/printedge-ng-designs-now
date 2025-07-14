import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Palette, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductSpec {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  specifications?: ProductSpec[];
  customDimensions?: boolean;
  sizeOptions?: { size: string; price: number }[];
  unitOptions?: { unit: string; price: number }[];
  tierOptions?: { tier: string; price: number; description: string }[];
}

const products: Product[] = [
  {
    id: "business-cards",
    name: "Business Cards",
    basePrice: 14000,
    description: "Professional business cards that make lasting impressions. Premium quality printing with various finish options.",
    specifications: [
      { name: "Curved edge", price: 1000 },
      { name: "600grams", price: 3000 },
      { name: "Express Delivery", price: 4000 }
    ]
  },
  {
    id: "branded-tshirt",
    name: "Branded T-shirt",
    basePrice: 6000,
    description: "High-quality branded t-shirts perfect for corporate events, promotions, and team uniforms.",
    sizeOptions: [
      { size: "L, M, S", price: 2000 },
      { size: "XL", price: 3000 },
      { size: "XXL", price: 5000 }
    ]
  },
  {
    id: "mugs",
    name: "Mugs",
    basePrice: 2000,
    description: "Custom printed mugs perfect for corporate gifts and promotional items.",
    specifications: [
      { name: "Magic Mug", price: 5000 }
    ]
  },
  {
    id: "banner",
    name: "Banner",
    basePrice: 0,
    description: "Custom banners for events, promotions, and advertising. Price calculated based on dimensions.",
    customDimensions: true
  },
  {
    id: "flyers-brochure",
    name: "Flyers & Brochure",
    basePrice: 0,
    description: "Eye-catching marketing materials for events, promotions, and business advertising.",
    unitOptions: [
      { unit: "A4 Flyer", price: 150 },
      { unit: "A5 Flyer", price: 80 },
      { unit: "A6 Flyer", price: 50 }
    ]
  },
  {
    id: "wedding-invitations",
    name: "Wedding Invitations",
    basePrice: 0,
    description: "Elegant wedding invitations with customized printing included. Perfect for your special day.",
    tierOptions: [
      { tier: "Luxury Card", price: 100000, description: "100pcs - Premium materials with gold foiling" },
      { tier: "Middle Class Card", price: 60000, description: "100pcs - High-quality printing on premium paper" }
    ]
  }
];

const Products = () => {
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});

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
    let total = product.basePrice;
    const productId = product.id;

    // Add specification costs
    if (product.specifications && selectedSpecs[productId]) {
      selectedSpecs[productId].forEach(specName => {
        const spec = product.specifications?.find(s => s.name === specName);
        if (spec) total += spec.price;
      });
    }

    // Add size costs
    if (product.sizeOptions && selectedSizes[productId]) {
      const size = product.sizeOptions.find(s => s.size === selectedSizes[productId]);
      if (size) total += size.price;
    }

    // Calculate banner price
    if (product.customDimensions && dimensions[productId]) {
      const { width, height } = dimensions[productId];
      if (width && height) {
        total = width * height * 300;
      }
    }

    // Calculate flyer price with quantity
    if (product.unitOptions && selectedUnits[productId] && quantities[productId]) {
      const unit = product.unitOptions.find(u => u.unit === selectedUnits[productId]);
      if (unit) {
        total = unit.price * quantities[productId];
      }
    }

    // Set tier pricing
    if (product.tierOptions && selectedTiers[productId]) {
      const tier = product.tierOptions.find(t => t.tier === selectedTiers[productId]);
      if (tier) total = tier.price;
    }

    return total;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
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
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="mt-2">{product.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₦{calculatePrice(product).toLocaleString()}
                    </p>
                    {product.basePrice > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Base: ₦{product.basePrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Design Upload/Create Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Design
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Create Design
                  </Button>
                </div>

                {/* Specifications */}
                {product.specifications && (
                  <div>
                    <Label className="text-base font-semibold">Extra Specifications</Label>
                    <div className="grid gap-2 mt-2">
                      {product.specifications.map((spec) => (
                        <div key={spec.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedSpecs[product.id]?.includes(spec.name) || false}
                              onChange={() => toggleSpec(product.id, spec.name)}
                              className="rounded"
                            />
                            <span>{spec.name}</span>
                          </div>
                          <span className="font-semibold text-primary">+₦{spec.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Options */}
                {product.sizeOptions && (
                  <div>
                    <Label className="text-base font-semibold">Size Options</Label>
                    <div className="grid gap-2 mt-2">
                      {product.sizeOptions.map((size) => (
                        <div key={size.size} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`size-${product.id}`}
                              checked={selectedSizes[product.id] === size.size}
                              onChange={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size.size }))}
                            />
                            <span>{size.size}</span>
                          </div>
                          <span className="font-semibold text-primary">+₦{size.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Dimensions for Banner */}
                {product.customDimensions && (
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
                {product.unitOptions && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Size Options</Label>
                      <div className="grid gap-2 mt-2">
                        {product.unitOptions.map((unit) => (
                          <div key={unit.unit} className="flex items-center justify-between p-3 border rounded-lg">
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
                {product.tierOptions && (
                  <div>
                    <Label className="text-base font-semibold">Package Options</Label>
                    <div className="grid gap-2 mt-2">
                      {product.tierOptions.map((tier) => (
                        <div key={tier.tier} className="p-4 border rounded-lg">
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
                <Button className="w-full" size="lg">
                  Add to Cart - ₦{calculatePrice(product).toLocaleString()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;