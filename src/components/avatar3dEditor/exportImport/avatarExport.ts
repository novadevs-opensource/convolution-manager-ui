import { AvatarState } from '../useAvatarState';

// Función para exportar la configuración del avatar a JSON
export const exportAvatar = (state: AvatarState): string => {
  return JSON.stringify(state, null, 2);
};

// Función para importar la configuración del avatar desde un archivo JSON
export const importAvatar = async (file: File): Promise<AvatarState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        resolve(parsed as AvatarState);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
