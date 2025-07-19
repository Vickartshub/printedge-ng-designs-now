-- Create banners table for editable main banners
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT DEFAULT 'Learn More',
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 1,
  image_dimensions TEXT DEFAULT '1920x1080 (16:9 aspect ratio) - Hero banner dimensions',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policies for banner access
CREATE POLICY "Banners are viewable by everyone" 
ON public.banners 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify banners" 
ON public.banners 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default banner
INSERT INTO public.banners (title, subtitle, description, image_url, button_text, position, image_dimensions)
VALUES (
  'Professional Print Solutions',
  'Quality designs for your business needs',
  'From business cards to large format printing, we deliver exceptional results that make your brand stand out.',
  '/src/assets/hero-image.jpg',
  'View Our Services',
  1,
  '1920x1080 (16:9 aspect ratio) - Main hero banner for homepage'
);