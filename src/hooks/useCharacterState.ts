// src/hooks/useCharacterState.ts
import { useState, useCallback, useRef } from 'react';
import { CharacterData, MessageExample } from '../types';
import { isEqual } from 'lodash';

/**
 * Custom hook for managing character state and updates
 */
export function useCharacterState(initialCharacter: CharacterData, initialModel: string = '') {
  const [character, setCharacter] = useState<CharacterData>(initialCharacter);
  const [selectedModelValue, setSelectedModelValue] = useState<string>(initialModel);
  
  // Refs para evitar actualizaciones innecesarias
  const previousCharacter = useRef<CharacterData>(initialCharacter);
  
  /**
   * Update a character field by path (supports nested paths using dot notation)
   */
  const handleInputChange = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setCharacter(prev => {
        // Crear un clon del objeto actual
        const newChar = { ...prev } as any;
        let pointer = newChar;
        let oldPointer = prev as any;
        let valueChanged = false;
        
        // Navigate to the nested property and update it
        for (let i = 0; i < keys.length - 1; i++) {
          if (!pointer[keys[i]]) {
            pointer[keys[i]] = {};
            valueChanged = true;
          } else {
            pointer[keys[i]] = { ...pointer[keys[i]] };
          }
          
          pointer = pointer[keys[i]];
          oldPointer = oldPointer?.[keys[i]];
        }
        
        // Si el valor es el mismo, no hay necesidad de actualizar
        if (oldPointer && oldPointer[keys[keys.length - 1]] === value && !valueChanged) {
          return prev; // Return previous state if value hasn't changed
        }
        
        pointer[keys[keys.length - 1]] = value;
        previousCharacter.current = newChar;
        return newChar;
      });
    } else {
      setCharacter(prev => {
        // Si el valor es el mismo, no hay necesidad de actualizar
        if (prev[field as keyof CharacterData] === value) {
          return prev; // Return previous state if value hasn't changed
        }
        
        const newChar = { ...prev, [field]: value };
        previousCharacter.current = newChar;
        return newChar;
      });
    }
  }, []);
  
  /**
   * Update multiple character fields at once
   */
  const updateCharacterFields = useCallback((fields: Record<string, any>) => {
    setCharacter(prev => {
      const updatedCharacter = { ...prev };
      let hasChanges = false;
      
      Object.entries(fields).forEach(([field, value]) => {
        if (field.includes('.')) {
          const keys = field.split('.');
          let pointer = updatedCharacter as any;
          let oldPointer = prev as any;
          
          // Navigate to the nested property
          for (let i = 0; i < keys.length - 1; i++) {
            if (!pointer[keys[i]]) {
              pointer[keys[i]] = {};
              hasChanges = true;
            } else {
              pointer[keys[i]] = { ...pointer[keys[i]] };
            }
            
            pointer = pointer[keys[i]];
            oldPointer = oldPointer?.[keys[i]];
          }
          
          // Solo actualiza si el valor ha cambiado
          const lastKey = keys[keys.length - 1];
          if (oldPointer && oldPointer[lastKey] !== value) {
            pointer[lastKey] = value;
            hasChanges = true;
          }
        } else {
          // Solo actualiza si el valor ha cambiado
          if (updatedCharacter[field as keyof CharacterData] !== value) {
            (updatedCharacter as any)[field] = value;
            hasChanges = true;
          }
        }
      });
      
      // Solo devuelve el nuevo objeto si hubo cambios
      if (hasChanges) {
        previousCharacter.current = updatedCharacter;
        return updatedCharacter;
      }
      
      return prev;
    });
  }, []);
  
  /**
   * Update the character's knowledge
   */
  const updateKnowledge = useCallback((newKnowledge: string[]) => {
    setCharacter(prev => {
      // Si los arrays son iguales, no actualizamos
      if (isEqual(prev.knowledge, newKnowledge)) {
        return prev;
      }
      
      const newChar = { ...prev, knowledge: newKnowledge };
      previousCharacter.current = newChar;
      return newChar;
    });
  }, []);
  
  /**
   * Update the character's message examples
   */
  const updateMessageExamples = useCallback((newExamples: MessageExample[][]) => {
    setCharacter(prev => {
      // Si los arrays son iguales, no actualizamos
      if (isEqual(prev.messageExamples, newExamples)) {
        return prev;
      }
      
      const newChar = { ...prev, messageExamples: newExamples };
      previousCharacter.current = newChar;
      return newChar;
    });
  }, []);
  
  /**
   * Update the character's post examples
   */
  const updatePostExamples = useCallback((newPosts: string[]) => {
    setCharacter(prev => {
      // Si los arrays son iguales, no actualizamos
      if (isEqual(prev.postExamples, newPosts)) {
        return prev;
      }
      
      const newChar = { ...prev, postExamples: newPosts };
      previousCharacter.current = newChar;
      return newChar;
    });
  }, []);
  
  /**
   * Update the character's adjectives
   */
  const updateAdjectives = useCallback((newAdjectives: string[]) => {
    setCharacter(prev => {
      // Si los arrays son iguales, no actualizamos
      if (isEqual(prev.adjectives, newAdjectives)) {
        return prev;
      }
      
      const newChar = { ...prev, adjectives: newAdjectives };
      previousCharacter.current = newChar;
      return newChar;
    });
  }, []);
  
  /**
   * Update the character's people to interact with
   */
  const updatePeople = useCallback((newPeople: string[]) => {
    setCharacter(prev => {
      // Si los arrays son iguales, no actualizamos
      if (isEqual(prev.people, newPeople)) {
        return prev;
      }
      
      const newChar = { ...prev, people: newPeople };
      previousCharacter.current = newChar;
      return newChar;
    });
  }, []);
  
  /**
   * Completely replace the character data
   */
  const setFullCharacter = useCallback((newCharacter: CharacterData) => {
    if (isEqual(previousCharacter.current, newCharacter)) {
      return; // No update needed if data is the same
    }
    
    setCharacter(newCharacter);
    previousCharacter.current = newCharacter;
  }, []);
  
  /**
   * Update Twitter target users based on people array
   */
  const syncTwitterTargetUsers = useCallback(() => {
    if (character.clients.includes('twitter')) {
      // Avoid unnecessary updates by checking if the value would change
      const currentTargetUsers = character.settings?.TWITTER_TARGET_USERS || '';
      const newTargetUsers = character.people.length > 0 ? character.people.join(',') : '';
      
      if (currentTargetUsers !== newTargetUsers) {
        const newSettings = {...character.settings};
        newSettings.TWITTER_TARGET_USERS = newTargetUsers;
        setCharacter(prev => {
          const newChar = { ...prev, settings: newSettings };
          previousCharacter.current = newChar;
          return newChar;
        });
        return true;
      }
    }
    return false;
  }, [character.clients, character.people, character.settings]);
  
  return {
    character,
    selectedModelValue,
    setSelectedModelValue,
    handleInputChange,
    updateCharacterFields,
    updateKnowledge,
    updateMessageExamples,
    updatePostExamples,
    updateAdjectives,
    updatePeople,
    setFullCharacter,
    syncTwitterTargetUsers
  };
}