-- Add customization_options column to products table
ALTER TABLE public.products 
ADD COLUMN customization_options JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance when querying customization options
CREATE INDEX idx_products_customization_options ON public.products USING GIN(customization_options);

-- Add comment to explain the structure
COMMENT ON COLUMN public.products.customization_options IS 'Array of customization options with structure: [{type: "size|color|finish|material", name: string, options: [{value: string, label: string, price: number}]}]';