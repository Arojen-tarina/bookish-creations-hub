import { useState, useCallback, useEffect } from 'react';
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

const BATCH_SIZE = 1;
const STORAGE_KEY = 'mongolian-game-card-images';
const ERRORS_KEY = 'mongolian-game-card-errors';

// Helper to load saved images from localStorage
function loadSavedImages(): Map<string, string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Failed to load saved images:', e);
  }
  return new Map();
}

// Helper to save images to localStorage
function saveImages(images: Map<string, string>) {
  try {
    const obj = Object.fromEntries(images);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save images:', e);
  }
}

// Helper to load saved errors from localStorage
function loadSavedErrors(): Map<string, string> {
  try {
    const saved = localStorage.getItem(ERRORS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Failed to load saved errors:', e);
  }
  return new Map();
}

// Helper to save errors to localStorage
function saveErrors(errors: Map<string, string>) {
  try {
    const obj = Object.fromEntries(errors);
    localStorage.setItem(ERRORS_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save errors:', e);
  }
}

export function useCardImageGenerator() {
  const [state, setState] = useState<GenerationState>(() => ({
    isGenerating: false,
    progress: {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: 0,
    },
    generatedImages: loadSavedImages(),
    errors: loadSavedErrors(),
  }));

  // Sync to localStorage whenever images or errors change
  useEffect(() => {
    saveImages(state.generatedImages);
  }, [state.generatedImages]);

  useEffect(() => {
    saveErrors(state.errors);
  }, [state.errors]);

  const generateImages = useCallback(async (cards: GameCard[]) => {
    // Filter out already generated cards
    const existingImages = loadSavedImages();
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

      if (i + BATCH_SIZE < cardsToGenerate.length) {
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ERRORS_KEY);
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
