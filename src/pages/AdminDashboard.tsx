import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  Edit,
  Save,
  Plus,
  Eye,
  Settings
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface FlashBanner {
  id: string;
  title: string;
  description: string;
  link_url: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [flashBanners, setFlashBanners] = useState<FlashBanner[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<FlashBanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Load flash banners
      const { data: bannersData } = await supabase
        .from('flash_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsData) setProducts(productsData);
      if (ordersData) {
        setOrders(ordersData);
        
        // Calculate stats
        const totalRevenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
        const pendingOrders = ordersData.filter(order => order.status === 'pending').length;
        
        setStats({
          totalOrders: ordersData.length,
          totalRevenue,
          pendingOrders,
          totalProducts: productsData?.length || 0,
        });
      }
      if (bannersData) setFlashBanners(bannersData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          base_price: product.base_price,
          image_url: product.image_url,
          category: product.category,
          is_active: product.is_active,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      
      setEditingProduct(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(product);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product created successfully.",
      });
      
      setEditingProduct(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
      
      loadDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const updateFlashBanner = async (banner: FlashBanner) => {
    try {
      const { error } = await supabase
        .from('flash_banners')
        .update({
          title: banner.title,
          description: banner.description,
          link_url: banner.link_url,
          background_color: banner.background_color,
          text_color: banner.text_color,
          is_active: banner.is_active,
        })
        .eq('id', banner.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flash banner updated successfully.",
      });
      
      setEditingBanner(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating flash banner:', error);
      toast({
        title: "Error",
        description: "Failed to update flash banner.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Admin Panel</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="banners">Flash Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{order.order_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name} ({order.customer_email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₦{parseFloat(order.total_amount.toString()).toLocaleString()}</div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'}>
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                      >
                        Mark Processing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Products Management</CardTitle>
                <Button onClick={() => setEditingProduct({
                  id: '',
                  name: '',
                  description: '',
                  base_price: 0,
                  image_url: '',
                  category: '',
                  is_active: true,
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">₦{product.base_price.toLocaleString()}</span>
                          <Badge variant="outline">{product.category}</Badge>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Flash Banners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flashBanners.map((banner) => (
                  <div 
                    key={banner.id} 
                    className="border rounded-lg p-4"
                    style={{ backgroundColor: banner.background_color + '20' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{banner.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{banner.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">Link: {banner.link_url}</span>
                          <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBanner(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct.id ? 'Edit Product' : 'Add Product'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    description: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="price">Base Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingProduct.base_price}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    base_price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    category: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    image_url: e.target.value
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={editingProduct.is_active}
                  onCheckedChange={(checked) => setEditingProduct({
                    ...editingProduct,
                    is_active: checked
                  })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  if (editingProduct.id) {
                    updateProduct(editingProduct);
                  } else {
                    createProduct(editingProduct);
                  }
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Flash Banner</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="banner-title">Title</Label>
                <Input
                  id="banner-title"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({
                    ...editingBanner,
                    title: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="banner-description">Description</Label>
                <Textarea
                  id="banner-description"
                  value={editingBanner.description}
                  onChange={(e) => setEditingBanner({
                    ...editingBanner,
                    description: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="banner-link">Link URL</Label>
                <Input
                  id="banner-link"
                  value={editingBanner.link_url}
                  onChange={(e) => setEditingBanner({
                    ...editingBanner,
                    link_url: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="bg-color">Background Color</Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={editingBanner.background_color}
                  onChange={(e) => setEditingBanner({
                    ...editingBanner,
                    background_color: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="text-color">Text Color</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={editingBanner.text_color}
                  onChange={(e) => setEditingBanner({
                    ...editingBanner,
                    text_color: e.target.value
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="banner-active"
                  checked={editingBanner.is_active}
                  onCheckedChange={(checked) => setEditingBanner({
                    ...editingBanner,
                    is_active: checked
                  })}
                />
                <Label htmlFor="banner-active">Active</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={() => updateFlashBanner(editingBanner)}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingBanner(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;