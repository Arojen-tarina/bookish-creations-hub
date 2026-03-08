/**
 * useCardImageGenerator.ts — Korttikuvien generointi ja hallinta
 *
 * Generoi pelikorttien kuvat backend-funktiolla (generate-card-image)
 * erissä (BATCH_SIZE=1). Lataa olemassa olevat kuvat tietokannasta
 * ja seuraa generointiprosessin edistymistä.
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameCard } from '@/data/gameCards';

interface GeneratedImage {
  cardId: string;
  imageUrl: string;
  success: boolean;
  error?: string;
  cached?: boolean;
}

interface GenerationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  cached: number;
  currentBatch: number;
  totalBatches: number;
}

interface GenerationState {
  isGenerating: boolean;
  progress: GenerationProgress;
  generatedImages: Map<string, string>;
  errors: Map<string, string>;
  isLoading: boolean;
}

const BATCH_SIZE = 1;

export function useCardImageGenerator() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      cached: 0,
      currentBatch: 0,
      totalBatches: 0,
    },
    generatedImages: new Map(),
    errors: new Map(),
    isLoading: true,
  });

  // Load existing images from database on mount
  useEffect(() => {
    async function loadExistingImages() {
      try {
        const { data, error } = await supabase
          .from('generated_cards')
          .select('id, image_url');

        if (error) {
          console.error('Failed to load existing images:', error);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const images = new Map<string, string>();
        data?.forEach(card => {
          images.set(card.id, card.image_url);
        });

        console.log(`Loaded ${images.size} existing card images from database`);

        setState(prev => ({
          ...prev,
          generatedImages: images,
          isLoading: false,
        }));
      } catch (e) {
        console.error('Error loading images:', e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    loadExistingImages();
  }, []);

  const generateImages = useCallback(async (cards: GameCard[]) => {
    // Filter out already generated cards
    const existingImages = state.generatedImages;
    const cardsToGenerate = cards.filter(card => !existingImages.has(card.id));
    
    if (cardsToGenerate.length === 0) {
      console.log('All cards already generated!');
      return [];
    }

    console.log(`Generating ${cardsToGenerate.length} cards (${existingImages.size} already done)`);
    
    const totalBatches = Math.ceil(cardsToGenerate.length / BATCH_SIZE);
    
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: {
        total: cardsToGenerate.length,
        processed: 0,
        successful: 0,
        failed: 0,
        cached: 0,
        currentBatch: 0,
        totalBatches,
      },
    }));

    const allResults: GeneratedImage[] = [];

    for (let i = 0; i < cardsToGenerate.length; i += BATCH_SIZE) {
      // Check if generation was stopped
      const currentState = await new Promise<GenerationState>(resolve => {
        setState(prev => {
          resolve(prev);
          return prev;
        });
      });
      
      if (!currentState.isGenerating) {
        console.log('Generation stopped by user');
        break;
      }

      const batch = cardsToGenerate.slice(i, i + BATCH_SIZE);
      const currentBatchNum = Math.floor(i / BATCH_SIZE) + 1;

      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          currentBatch: currentBatchNum,
        },
      }));

      try {
        const { data, error } = await supabase.functions.invoke('generate-card-image', {
          body: {
            cards: batch.map(card => ({
              cardId: card.id,
              cardName: card.name,
              cardType: card.type,
              cardDescription: card.description,
            })),
          },
        });

        if (error) {
          console.error('Batch error:', error);
          batch.forEach(card => {
            allResults.push({
              cardId: card.id,
              imageUrl: '',
              success: false,
              error: error.message,
            });
          });
        } else if (data?.results) {
          allResults.push(...data.results);
        }
      } catch (err) {
        console.error('Batch exception:', err);
        batch.forEach(card => {
          allResults.push({
            cardId: card.id,
            imageUrl: '',
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        });
      }

      const processed = Math.min(i + BATCH_SIZE, cardsToGenerate.length);
      const successful = allResults.filter(r => r.success).length;
      const failed = allResults.filter(r => !r.success).length;
      const cached = allResults.filter(r => r.cached).length;

      setState(prev => {
        const newImages = new Map(prev.generatedImages);
        const newErrors = new Map(prev.errors);
        
        allResults.slice(-BATCH_SIZE).forEach(result => {
          if (result.success && result.imageUrl) {
            newImages.set(result.cardId, result.imageUrl);
          } else if (result.error) {
            newErrors.set(result.cardId, result.error);
          }
        });

        return {
          ...prev,
          progress: {
            ...prev.progress,
            processed,
            successful,
            failed,
            cached,
          },
          generatedImages: newImages,
          errors: newErrors,
        };
      });

      if (i + BATCH_SIZE < cardsToGenerate.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setState(prev => ({
      ...prev,
      isGenerating: false,
    }));

    return allResults;
  }, [state.generatedImages]);

  const stopGeneration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: false,
    }));
  }, []);

  const clearResults = useCallback(async () => {
    // Note: This only clears local state, not the database
    // Images remain in storage for persistence
    setState({
      isGenerating: false,
      progress: {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        cached: 0,
        currentBatch: 0,
        totalBatches: 0,
      },
      generatedImages: new Map(),
      errors: new Map(),
      isLoading: false,
    });
  }, []);

  const refreshImages = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase
        .from('generated_cards')
        .select('id, image_url');

      if (error) throw error;

      const images = new Map<string, string>();
      data?.forEach(card => {
        images.set(card.id, card.image_url);
      });

      setState(prev => ({
        ...prev,
        generatedImages: images,
        isLoading: false,
      }));
    } catch (e) {
      console.error('Error refreshing images:', e);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    ...state,
    generateImages,
    stopGeneration,
    clearResults,
    refreshImages,
  };
}
