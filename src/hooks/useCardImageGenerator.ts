import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameCard } from '@/data/gameCards';

interface GeneratedImage {
  cardId: string;
  imageUrl: string;
  success: boolean;
  error?: string;
}

interface GenerationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

interface GenerationState {
  isGenerating: boolean;
  progress: GenerationProgress;
  generatedImages: Map<string, string>;
  errors: Map<string, string>;
}

const BATCH_SIZE = 1; // Process 1 card at a time for maximum reliability

export function useCardImageGenerator() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: 0,
    },
    generatedImages: new Map(),
    errors: new Map(),
  });

  const generateImages = useCallback(async (cards: GameCard[]) => {
    const totalBatches = Math.ceil(cards.length / BATCH_SIZE);
    
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: {
        total: cards.length,
        processed: 0,
        successful: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches,
      },
      generatedImages: new Map(),
      errors: new Map(),
    }));

    const allResults: GeneratedImage[] = [];

    // Process cards in batches
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);
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
          // Mark all cards in batch as failed
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

      // Update progress after each batch
      const processed = Math.min(i + BATCH_SIZE, cards.length);
      const successful = allResults.filter(r => r.success).length;
      const failed = allResults.filter(r => !r.success).length;

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
          },
          generatedImages: newImages,
          errors: newErrors,
        };
      });

      // Longer delay between cards to prevent rate limiting
      if (i + BATCH_SIZE < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setState(prev => ({
      ...prev,
      isGenerating: false,
    }));

    return allResults;
  }, []);

  const stopGeneration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: false,
    }));
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isGenerating: false,
      progress: {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: 0,
      },
      generatedImages: new Map(),
      errors: new Map(),
    });
  }, []);

  return {
    ...state,
    generateImages,
    stopGeneration,
    clearResults,
  };
}
