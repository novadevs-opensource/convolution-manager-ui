import { useState, useEffect, useCallback } from 'react';
import { OpenRouterModel, CharacterData } from '../types';
import { ApiKeyService } from '../services/apiKeyService';

/**
 * Custom hook for managing OpenRouter models
 */
export function useOpenRouterModels(apiKeyService: ApiKeyService) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  
  /**
   * Fetch available models from OpenRouter API
   */
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const text2textModels = data.data.filter(
        (model: OpenRouterModel) => model.architecture.modality === 'text->text'
      );
      
      setModels(text2textModels);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch models on mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);
  
  /**
   * Find the default model (free model) to use
   */
  const getDefaultModelId = useCallback(() => {
    if (models.length === 0) return '';
    
    // Try to find the free Llama 3 model
    const defaultModelId = models.find(
      model => model.id === 'meta-llama/llama-3.3-70b-instruct:free'
    )?.id;
    
    return defaultModelId || models[0].id;
  }, [models]);
  
  /**
   * Update character with the selected model
   */
  const configureModelSettings = useCallback((character: CharacterData, modelId: string): CharacterData => {
    const model = models.find(model => model.id === modelId);
    if (!model) return character;
    
    const updatedCharacter = { ...character };
    
    // Update model settings
    if (!updatedCharacter.settings) updatedCharacter.settings = { secrets: {}, voice: { model: '' } };
    if (!updatedCharacter.settings.secrets) updatedCharacter.settings.secrets = {};
    
    updatedCharacter.settings.secrets.OPENROUTER_MODEL = model.id;
    updatedCharacter.settings.secrets.SMALL_OPENROUTER_MODEL = model.id;
    updatedCharacter.settings.secrets.MEDIUM_OPENROUTER_MODEL = model.id;
    updatedCharacter.settings.secrets.LARGE_OPENROUTER_MODEL = model.id;
    updatedCharacter.settings.secrets.OPENROUTER_API_KEY = apiKeyService.getApiKey()!;
    updatedCharacter.modelProvider = 'openrouter';
    
    return updatedCharacter;
  }, [models]);
  
  /**
   * Check if model is a free model
   */
  const isModelFree = useCallback((modelId: string): boolean => {
    return modelId.includes(':free');
  }, []);
  
  return {
    models,
    loading,
    error,
    fetchModels,
    getDefaultModelId,
    configureModelSettings,
    isModelFree
  };
}