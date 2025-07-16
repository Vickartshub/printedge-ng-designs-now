import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FlashBanner {
  id: string;
  title: string;
  description: string;
  link_url: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export const FlashBanner = () => {
  const [banner, setBanner] = useState<FlashBanner | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from('flash_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setBanner(data);
      }
    };

    fetchBanner();
  }, []);

  if (!banner || !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className="relative text-center py-3 px-4 animate-fade-in"
      style={{ 
        backgroundColor: banner.background_color,
        color: banner.text_color,
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          {banner.link_url ? (
            <Link 
              to={banner.link_url}
              className="hover:underline cursor-pointer"
            >
              <span className="font-semibold mr-2">{banner.title}</span>
              {banner.description && (
                <span className="text-sm opacity-90">{banner.description}</span>
              )}
            </Link>
          ) : (
            <>
              <span className="font-semibold mr-2">{banner.title}</span>
              {banner.description && (
                <span className="text-sm opacity-90">{banner.description}</span>
              )}
            </>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="p-1 h-auto hover:bg-black/10"
          style={{ color: banner.text_color }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};