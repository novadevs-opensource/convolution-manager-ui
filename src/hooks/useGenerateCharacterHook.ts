// src/hooks/useGenerateCharacterHook.ts
import { useState } from 'react';
import { CharacterData } from '../types';

interface GenerateCharacterOptions {
  onSuccess?: (character: CharacterData) => void;
  onError?: (error: Error) => void;
}

export const useGenerateCharacter = () => {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [prompt, setPrompt] = useState<string>();

  const generateCharacter = async (
    prompt: string,
    model: string,
    apiKey: string,
    options?: GenerateCharacterOptions
  ) => {
    setLoading(true);
    setError(null);
    setPrompt(prompt);
    let attempts = 0;
    let lastError: Error | null = null;

    try {
      while (attempts < 3) {
        try {
          const response = await fetch(
            `${process.env.HOST}:${process.env.PORT}/api/generate-character`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
              },
              body: JSON.stringify({ prompt, model }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            // Si es error 500 con el mensaje específico, reintenta
            if (response.status === 500) {
              attempts++;
              if (attempts < 3) {
                continue; // se reintenta la petición
              } else {
                throw new Error(errorData.error);
              }
            } else {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          }

          // Si la respuesta es exitosa, parseamos el JSON
          const data = await response.json();

          // Aseguramos que la propiedad 'people' existe
          if (!data.character.people) {
            data.character.people = [];
          }

          setCharacter(data.character);
          if (options?.onSuccess) {
            options.onSuccess(data.character);
          }
          return data.character;
        } catch (err: any) {
          lastError =
            err instanceof Error ? err : new Error(err.message || 'Unknown error');
          // Si ya hemos intentado 3 veces, se lanza el error final
          if (attempts >= 2) {
            throw lastError;
          }
          attempts++;
        }
      }
      // Si salimos del bucle sin éxito, lanzamos el último error capturado
      throw lastError;
    } catch (finalError: any) {
      const errorToThrow =
        finalError instanceof Error
          ? finalError
          : new Error(finalError.message || 'Unknown error');
      setError(errorToThrow);
      if (options?.onError) {
        options.onError(errorToThrow);
      }
      throw errorToThrow;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setCharacter(null);
    setLoading(false);
    setError(null);
  };

  return {
    character,
    loading,
    error,
    generateCharacter,
    resetState,
    prompt,
  };
};
