import { useState, useCallback } from 'react';

interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
}

interface ImageGenerationResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// Images de fallback pour chaque matière
const fallbackImages = {
  mathematics: '/images/math-fallback.svg',
  science: '/images/science-fallback.svg',
  history: '/images/history-fallback.svg',
  literature: '/images/literature-fallback.svg',
  programming: '/images/programming-fallback.svg',
  art: '/images/art-fallback.svg',
  default: '/images/education_illustration.svg'
};

export const useImageGeneration = () => {
  const [results, setResults] = useState<Record<string, ImageGenerationResult>>({});

  const generateImage = useCallback(async (
    key: string,
    options: ImageGenerationOptions,
    fallbackCategory: keyof typeof fallbackImages = 'default'
  ): Promise<string> => {
    // Initialise le state pour cette clé
    setResults(prev => ({
      ...prev,
      [key]: { imageUrl: null, isLoading: true, error: null }
    }));

    try {
      // Utilisation de l'API Hugging Face (gratuite avec limite)
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Note: Pour un usage en production, il faudrait utiliser une clé API
            // 'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({
            inputs: `Educational illustration, ${options.prompt}, clean design, professional, modern style, flat design`,
            parameters: {
              width: options.width || 512,
              height: options.height || 512,
              num_inference_steps: 20,
              guidance_scale: 7.5
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setResults(prev => ({
        ...prev,
        [key]: { imageUrl, isLoading: false, error: null }
      }));

      return imageUrl;
    } catch (error) {
      console.warn(`Failed to generate image for ${key}, using fallback:`, error);
      
      // Utilise l'image de fallback
      const fallbackUrl = fallbackImages[fallbackCategory];
      
      setResults(prev => ({
        ...prev,
        [key]: { 
          imageUrl: fallbackUrl, 
          isLoading: false, 
          error: 'Using fallback image' 
        }
      }));

      return fallbackUrl;
    }
  }, []);

  const getImageResult = useCallback((key: string): ImageGenerationResult => {
    return results[key] || { imageUrl: null, isLoading: false, error: null };
  }, [results]);

  const preloadFallbackImages = useCallback(() => {
    // Précharge les images de fallback pour une meilleure performance
    Object.values(fallbackImages).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return {
    generateImage,
    getImageResult,
    preloadFallbackImages
  };
};

export default useImageGeneration;
