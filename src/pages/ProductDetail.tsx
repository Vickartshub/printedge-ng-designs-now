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
import { ArrowLeft, Upload, Zap, Clock, Star, Shield, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  base_price: number;
  description: string;
  image_url?: string;
  category?: string;
  customization_options?: CustomizationOption[];
}

interface CustomizationOption {
  type: string;
  name: string;
  options: { value: string; label: string; price: number; }[];
}

interface ProductConfig {
  quantity: number;
  needsDesign: boolean;
  deliverySpeed: string;
  uploadedFile?: File;
  uploadedFileUrl?: string;
  customizations: { [key: string]: string };
}

const quantityOptions = [
  { value: 50, label: "50 pieces" },
  { value: 100, label: "100 pieces" },
  { value: 250, label: "250 pieces" },
  { value: 500, label: "500 pieces" },
  { value: 1000, label: "1000 pieces" },
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
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<ProductConfig>({
    quantity: 100,
    needsDesign: false,
    deliverySpeed: "standard",
    customizations: {},
  });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) {
        const productData = data as any;
        const customizationOptions = Array.isArray(productData.customization_options) 
          ? productData.customization_options 
          : [];
        
        setProduct({
          ...productData,
          customization_options: customizationOptions
        });
        
        // Initialize customization defaults
        const defaults: { [key: string]: string } = {};
        customizationOptions.forEach((option: CustomizationOption) => {
          if (option.options.length > 0) {
            defaults[option.type] = option.options[0].value;
          }
        });
        setConfig(prev => ({ ...prev, customizations: defaults }));
      }
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
    
    let total = product.base_price;
    
    // Add customization modifiers
    product.customization_options?.forEach(option => {
      const selectedValue = config.customizations[option.type];
      const selectedOption = option.options.find(opt => opt.value === selectedValue);
      if (selectedOption) {
        total += selectedOption.price;
      }
    });
    
    // Add delivery modifier
    const deliveryPrice = deliveryOptions.find(opt => opt.value === config.deliverySpeed)?.price || 0;
    total += deliveryPrice;
    
    // Design service
    if (config.needsDesign) total += 2000;
    
    // Multiply by quantity
    return total * config.quantity;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'application/pdf', 'application/postscript'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.ai')) {
      toast.error("Please upload PNG, PDF, or AI files only");
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `artwork/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('imagedirectory')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('imagedirectory')
        .getPublicUrl(filePath);

      setConfig(prev => ({ 
        ...prev, 
        uploadedFile: file,
        uploadedFileUrl: publicUrl
      }));

      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedFile = () => {
    setConfig(prev => ({ 
      ...prev, 
      uploadedFile: undefined,
      uploadedFileUrl: undefined
    }));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const cartItem = {
      product_name: product.name,
      product_description: product.description || '',
      product_id: product.id,
      quantity: config.quantity,
      unit_price: product.base_price,
      total_price: calculatePrice(),
      selected_specs: [{
        ...config.customizations,
        delivery: config.deliverySpeed,
        needsDesign: config.needsDesign,
      }],
      custom_dimensions: config.uploadedFileUrl ? JSON.stringify({
        uploadedFileUrl: config.uploadedFileUrl,
      }) : null,
    };

    await addToCart(cartItem);
    toast.success("Product added to cart!");
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

                  {/* Dynamic Customization Options */}
                  {product.customization_options?.map((option) => (
                    <div key={option.type}>
                      <Label className="text-base font-semibold">{option.name}</Label>
                      <Select 
                        value={config.customizations[option.type] || ''} 
                        onValueChange={(value) => 
                          setConfig(prev => ({ 
                            ...prev, 
                            customizations: { ...prev.customizations, [option.type]: value }
                          }))
                        }>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex justify-between items-center w-full">
                                <span>{opt.label}</span>
                                {opt.price !== 0 && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {opt.price > 0 ? '+' : ''}₦{opt.price}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  {/* File Upload */}
                  <div>
                    <Label className="text-base font-semibold">Upload Artwork</Label>
                    {!config.uploadedFile ? (
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        uploading 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'border-muted-foreground/30 hover:border-primary/50'
                      }`}>
                        {uploading ? (
                          <div className="space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-primary font-medium">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <Label htmlFor="file-upload" className="cursor-pointer">
                              <span className="text-sm font-medium text-primary hover:text-primary/80">Click to upload</span>
                              <span className="text-sm text-muted-foreground block">PNG, PDF, AI files (max 50MB)</span>
                            </Label>
                            <Input
                              id="file-upload"
                              type="file"
                              accept=".png,.pdf,.ai,.eps"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 border border-primary/20 bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-primary">{config.uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(config.uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={removeUploadedFile}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
                    
                    {/* Dynamic customization pricing */}
                    {product.customization_options?.map((option) => {
                      const selectedValue = config.customizations[option.type];
                      const selectedOption = option.options.find(opt => opt.value === selectedValue);
                      if (selectedOption && selectedOption.price !== 0) {
                        return (
                          <div key={option.type} className="flex justify-between text-sm">
                            <span>{option.name} adjustment</span>
                            <span>{selectedOption.price > 0 ? '+' : ''}₦{(selectedOption.price * config.quantity).toLocaleString()}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                    
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
                  
                  <Button className="w-full" size="lg" onClick={handleAddToCart}>
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