// src/hooks/useAgent.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/apiClient';
import { CharacterData, Agent } from '../types';

// Response interfaces
interface AgentSuccessResponse {
  message: string;
  character: Agent;
}

interface ValidationErrorResponse {
  errors: {
    [key: string]: string[];
  };
}

// Options for save and update operations
interface AgentOperationOptions {
  onSuccess?: (data: AgentSuccessResponse) => void;
  onError?: (error: ValidationErrorResponse | Error) => void;
  redirectTo?: string;
}

/**
 * Hook for agent API operations
 */
export function useAgent() {
  const [response, setResponse] = useState<AgentSuccessResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ValidationErrorResponse | Error | null>(null);
  const navigate = useNavigate();

  /**
   * Save a new character/agent
   */
  const saveCharacter = useCallback(async (
    userId: string, 
    llm_provider_model: string, 
    llm_provider_api_key: string, 
    definition: CharacterData,
    options?: AgentOperationOptions,
    auto_generation_prompt?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        "user_id": userId,
        "llm_provider_name": "openrouter",
        "llm_provider_model": llm_provider_model,
        "llm_provider_api_key": llm_provider_api_key,
        "definition": JSON.stringify(definition),
        ...(auto_generation_prompt ? { auto_generation_prompt } : {})
      };
      console.log(payload)
      
      const { data, status } = await api.post<AgentSuccessResponse>('/character', payload);
      
      if (status === 201) {
        setResponse(data);
        
        // Handle success callback if provided
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        // Handle redirect if provided
        if (options?.redirectTo && data.character.id) {
          navigate(options.redirectTo.replace(':id', data.character.id));
        }
        
        return data;
      } else {
        throw new Error("Unexpected response status: " + status);
      }
    } catch (err: any) {
      // Handle validation errors (422)
      if (err.response?.status === 422) {
        const validationError: ValidationErrorResponse = err.response.data;
        setError(validationError);
        
        if (options?.onError) {
          options.onError(validationError);
        }
      } 
      // Handle other errors
      else {
        const errorMessage = err.response?.data?.message || 'Failed to save character';
        const error = new Error(errorMessage);
        setError(error);
        
        if (options?.onError) {
          options.onError(error);
        }
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Update an existing character/agent
   */
  const updateCharacter = useCallback(async (
    agentId: string, 
    llm_provider_model: string, 
    llm_provider_api_key: string, 
    definition: CharacterData,
    options?: AgentOperationOptions
  ) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        "agent_id": agentId,
        "llm_provider_name": "openrouter",
        "llm_provider_model": llm_provider_model,
        "llm_provider_api_key": llm_provider_api_key,
        "definition": JSON.stringify(definition),
      };
      
      const { data, status } = await api.put<AgentSuccessResponse>('/character', payload);
      
      if (status === 200) {
        setResponse(data);
        
        // Handle success callback if provided
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        // Handle redirect if provided
        if (options?.redirectTo) {
          navigate(options.redirectTo.replace(':id', agentId));
        }
        
        return data;
      } else {
        throw new Error("Unexpected response status: " + status);
      }
    } catch (err: any) {
      // Handle validation errors (422)
      if (err.response?.status === 422) {
        const validationError: ValidationErrorResponse = err.response.data;
        setError(validationError);
        
        if (options?.onError) {
          options.onError(validationError);
        }
      } 
      // Handle other errors
      else {
        const errorMessage = err.response?.data?.message || 'Failed to update character';
        const error = new Error(errorMessage);
        setError(error);
        
        if (options?.onError) {
          options.onError(error);
        }
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);


  /**
   * Update agent avatar
   */
  const updateCharacterAvatar = useCallback(async (
    agentId: string,
    imageUrl: string,
    prompt: string,
    options?: AgentOperationOptions
  ) => {
    setLoading(true);
    setError(null);
    try {
        const payload = {
        "agent_id": agentId,
        "face_image_generation_prompt": prompt,
        "face_image_path": imageUrl,
      };
        
      const { data, status } = await api.put<AgentSuccessResponse>('/character/avatar', payload);
        
      if (status === 200) {
        setResponse(data);
          
        // Handle success callback if provided
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
          
        // Handle redirect if provided
        if (options?.redirectTo) {
          navigate(options.redirectTo.replace(':id', agentId));
        }
          
        return data;
      } else {
        throw new Error("Unexpected response status: " + status);
      }
    } catch (err: any) {
      // Handle validation errors (422)
      if (err.response?.status === 422) {
        const validationError: ValidationErrorResponse = err.response.data;
        setError(validationError);
          
        if (options?.onError) {
          options.onError(validationError);
        }
      } 
      // Handle other errors
        else {
        const errorMessage = err.response?.data?.message || 'Failed to update character';
        const error = new Error(errorMessage);
        setError(error);
          
        if (options?.onError) {
          options.onError(error);
        }
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Helper function to format error messages for display
   */
  const getFormattedErrorMessage = useCallback(() => {
    if (!error) return '';
    
    // For validation errors
    if ('errors' in error) {
      const messages: string[] = [];
      Object.entries(error.errors).forEach(([field, errors]) => {
        errors.forEach(err => messages.push(`${field}: ${err}`));
      });
      return messages.join(', ');
    } 
    // For regular errors
    else {
      return error.message || 'An unknown error occurred';
    }
  }, [error]);

  return { 
    response, 
    loading, 
    error,
    errorMessage: getFormattedErrorMessage(), 
    saveHandler: saveCharacter, 
    updateHandler: updateCharacter,
    updateAvatarHandler: updateCharacterAvatar,
  };
}

export default useAgent;