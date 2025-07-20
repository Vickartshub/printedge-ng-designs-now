-- Enable realtime for banners table
ALTER TABLE public.banners REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.banners;