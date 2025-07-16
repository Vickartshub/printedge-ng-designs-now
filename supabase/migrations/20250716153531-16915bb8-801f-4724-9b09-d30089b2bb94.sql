-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create product specifications table
CREATE TABLE public.product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create cart table
CREATE TABLE public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.cart(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_specs JSONB DEFAULT '[]',
  custom_dimensions JSONB,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  selected_specs JSONB DEFAULT '[]',
  custom_dimensions JSONB,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  design_files JSONB DEFAULT '[]'
);

-- Create flash banners table
CREATE TABLE public.flash_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  background_color TEXT DEFAULT '#f97316',
  text_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'admin',
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can modify products" ON public.products 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Product specifications policies
CREATE POLICY "Product specs are viewable by everyone" ON public.product_specifications FOR SELECT USING (true);
CREATE POLICY "Only admins can modify product specs" ON public.product_specifications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Cart policies
CREATE POLICY "Users can view their own cart" ON public.cart 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND session_id = current_setting('request.session_id', true))
  );
  
CREATE POLICY "Users can modify their own cart" ON public.cart 
  FOR ALL USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND session_id = current_setting('request.session_id', true))
  );

-- Cart items policies
CREATE POLICY "Users can view their cart items" ON public.cart_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cart c 
      WHERE c.id = cart_id AND (
        c.user_id = auth.uid() OR 
        (auth.uid() IS NULL AND c.session_id = current_setting('request.session_id', true))
      )
    )
  );

CREATE POLICY "Users can modify their cart items" ON public.cart_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cart c 
      WHERE c.id = cart_id AND (
        c.user_id = auth.uid() OR 
        (auth.uid() IS NULL AND c.session_id = current_setting('request.session_id', true))
      )
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can modify orders" ON public.orders 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can view all order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Order items can be created with orders" ON public.order_items FOR INSERT WITH CHECK (true);

-- Flash banners policies
CREATE POLICY "Flash banners are viewable by everyone" ON public.flash_banners FOR SELECT USING (true);
CREATE POLICY "Only admins can modify flash banners" ON public.flash_banners 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON public.admin_users 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Insert initial products
INSERT INTO public.products (name, description, base_price, category) VALUES
('Business Cards', 'Professional business cards that make lasting impressions. Premium quality printing with various finish options.', 14000, 'printing'),
('Branded T-shirt', 'High-quality branded t-shirts perfect for corporate events, promotions, and team uniforms.', 6000, 'apparel'),
('Mugs', 'Custom printed mugs perfect for corporate gifts and promotional items.', 2000, 'promotional'),
('Banner', 'Custom banners for events, promotions, and advertising. Price calculated based on dimensions.', 0, 'signage'),
('Flyers & Brochure', 'Eye-catching marketing materials for events, promotions, and business advertising.', 0, 'printing'),
('Wedding Invitations', 'Elegant wedding invitations with customized printing included. Perfect for your special day.', 0, 'invitations');

-- Insert initial flash banner
INSERT INTO public.flash_banners (title, description, link_url, is_active) VALUES
('🔥 Limited Time Offer!', 'Get 20% off on all business cards this week only!', '/products', true);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM now())::bigint % 100000)::text, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flash_banners_updated_at BEFORE UPDATE ON public.flash_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();