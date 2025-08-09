import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Zap, Clock, Star, Shield } from "lucide-react";

interface Product {
  id: string;
  name: string;
  base_price: number;
  description: string;
  image_url?: string;
  category?: string;
}

interface ProductConfig {
  quantity: number;
  size: string;
  material: string;
  finishing: string;
  needsDesign: boolean;
  deliverySpeed: string;
  uploadedFile?: File;
}

const quantityOptions = [
  { value: 50, label: "50 pieces" },
  { value: 100, label: "100 pieces" },
  { value: 250, label: "250 pieces" },
  { value: 500, label: "500 pieces" },
  { value: 1000, label: "1000 pieces" },
];

const sizeOptions = [
  { value: "a4", label: "A4 (210×297mm)", price: 0 },
  { value: "a5", label: "A5 (148×210mm)", price: -20 },
  { value: "a3", label: "A3 (297×420mm)", price: 50 },
];

const materialOptions = [
  { value: "standard", label: "Standard Paper (170gsm)", price: 0 },
  { value: "premium", label: "Premium Paper (250gsm)", price: 30 },
  { value: "cardstock", label: "Cardstock (350gsm)", price: 60 },
];

const finishingOptions = [
  { value: "none", label: "No Finishing", price: 0 },
  { value: "matte", label: "Matte Lamination", price: 25 },
  { value: "glossy", label: "Glossy Lamination", price: 25 },
  { value: "foiled", label: "Gold Foil Accent", price: 100 },
];

const deliveryOptions = [
  { value: "standard", label: "Standard (5-7 days)", price: 0, icon: Clock },
  { value: "express", label: "Express (2-3 days)", price: 500, icon: Zap },
  { value: "rush", label: "Rush (24-48 hrs)", price: 1500, icon: Star },
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ProductConfig>({
    quantity: 100,
    size: "a4",
    material: "standard",
    finishing: "none",
    needsDesign: false,
    deliverySpeed: "standard",
  });

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
    const title = product ? `Customize ${product.name} | Order Now` : "Customize Product";
    document.title = title;
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = product?.description ? `Customize and order ${product.name}. ${product.description.slice(0, 120)}` : "Customize your print product and order online";
    }
  }, [product]);

  const calculatePrice = () => {
    if (!product) return 0;
    
    let basePrice = product.base_price;
    
    // Size adjustment
    const sizeOption = sizeOptions.find(s => s.value === config.size);
    if (sizeOption) basePrice += sizeOption.price;
    
    // Material adjustment
    const materialOption = materialOptions.find(m => m.value === config.material);
    if (materialOption) basePrice += materialOption.price;
    
    // Finishing adjustment
    const finishingOption = finishingOptions.find(f => f.value === config.finishing);
    if (finishingOption) basePrice += finishingOption.price;
    
    // Delivery adjustment
    const deliveryOption = deliveryOptions.find(d => d.value === config.deliverySpeed);
    if (deliveryOption) basePrice += deliveryOption.price;
    
    // Design service
    if (config.needsDesign) basePrice += 2000;
    
    return basePrice * config.quantity;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setConfig(prev => ({ ...prev, uploadedFile: file }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hero Section - Product Preview */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Product Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden border">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={`${product.name} preview`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-muted/20 flex items-center justify-center">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p>Product Preview</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Premium Quality
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Customization Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Customize Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quantity */}
                  <div>
                    <Label className="text-base font-semibold">Quantity</Label>
                    <Select value={config.quantity.toString()} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, quantity: parseInt(value) }))
                    }>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {quantityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size */}
                  <div>
                    <Label className="text-base font-semibold">Size</Label>
                    <Select value={config.size} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, size: value }))
                    }>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{option.label}</span>
                              {option.price !== 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  {option.price > 0 ? '+' : ''}₦{option.price}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Material */}
                  <div>
                    <Label className="text-base font-semibold">Paper Type</Label>
                    <Select value={config.material} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, material: value }))
                    }>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {materialOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{option.label}</span>
                              {option.price !== 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  +₦{option.price}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Finishing */}
                  <div>
                    <Label className="text-base font-semibold">Finishing Options</Label>
                    <Select value={config.finishing} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, finishing: value }))
                    }>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {finishingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{option.label}</span>
                              {option.price !== 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  +₦{option.price}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="text-base font-semibold">Upload Artwork</Label>
                    <div className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm font-medium">Click to upload</span>
                        <span className="text-sm text-muted-foreground block">PNG, PDF, AI files (max 50MB)</span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".png,.pdf,.ai"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {config.uploadedFile && (
                        <p className="mt-2 text-sm text-primary font-medium">
                          ✓ {config.uploadedFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Design Help */}
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Need Design Help?</Label>
                      <p className="text-sm text-muted-foreground">Our designers will create your artwork (+₦2,000)</p>
                    </div>
                    <Switch
                      checked={config.needsDesign}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, needsDesign: checked }))
                      }
                    />
                  </div>

                  {/* Delivery Timeline */}
                  <div>
                    <Label className="text-base font-semibold">Delivery Timeline</Label>
                    <div className="grid gap-3 mt-2">
                      {deliveryOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div
                            key={option.value}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              config.deliverySpeed === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/20 hover:border-primary/30'
                            }`}
                            onClick={() => setConfig(prev => ({ ...prev, deliverySpeed: option.value }))}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-medium">{option.label}</p>
                                  {option.price > 0 && (
                                    <p className="text-sm text-muted-foreground">+₦{option.price.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                config.deliverySpeed === option.value
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30'
                              }`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base price ({config.quantity} pieces)</span>
                      <span>₦{(product.base_price * config.quantity).toLocaleString()}</span>
                    </div>
                    
                    {sizeOptions.find(s => s.value === config.size)?.price !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Size adjustment</span>
                        <span>₦{((sizeOptions.find(s => s.value === config.size)?.price || 0) * config.quantity).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {materialOptions.find(m => m.value === config.material)?.price !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Material upgrade</span>
                        <span>₦{((materialOptions.find(m => m.value === config.material)?.price || 0) * config.quantity).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {finishingOptions.find(f => f.value === config.finishing)?.price !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Finishing</span>
                        <span>₦{((finishingOptions.find(f => f.value === config.finishing)?.price || 0) * config.quantity).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {config.needsDesign && (
                      <div className="flex justify-between text-sm">
                        <span>Design service</span>
                        <span>₦2,000</span>
                      </div>
                    )}
                    
                    {deliveryOptions.find(d => d.value === config.deliverySpeed)?.price !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Express delivery</span>
                        <span>₦{(deliveryOptions.find(d => d.value === config.deliverySpeed)?.price || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₦{calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Add to Cart - ₦{calculatePrice().toLocaleString()}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Free shipping on orders over ₦50,000</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
