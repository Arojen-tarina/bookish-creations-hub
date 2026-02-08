import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedCardImages {
  images: Map<string, string>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGeneratedCardImages(): GeneratedCardImages {
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('generated_cards')
        .select('id, image_url');

      if (fetchError) {
        throw fetchError;
      }

      const imageMap = new Map<string, string>();
      data?.forEach(card => {
        imageMap.set(card.id, card.image_url);
      });

      setImages(imageMap);
    } catch (e) {
      console.error('Error loading generated card images:', e);
      setError(e instanceof Error ? e.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return {
    images,
    isLoading,
    error,
    refresh: loadImages,
  };
}
