import React, { useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface GLBImporterProps {
  onModelImported: (model: any) => void;
  onImportError: (error: Error) => void;
}

const GLBImporter: React.FC<GLBImporterProps> = ({ 
  onModelImported, 
  onImportError 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.glb')) {
      onImportError(new Error('El archivo seleccionado no es un GLB válido.'));
      return;
    }

    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const loader = new GLTFLoader();
      loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          console.log('Modelo GLB importado:', gltf);
          onModelImported(gltf);
        },
        (error) => {
          console.error(error);
          onImportError(new Error('Error al procesar el GLB.'));
        }
      );
    } catch (error) {
      console.error(error);
      onImportError(new Error('Error al leer el archivo.'));
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('No se pudo leer el archivo como ArrayBuffer.'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".glb"
        className="hidden"
      />
      <button 
        onClick={handleImportClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Importar Modelo GLB
      </button>
      <p className="mt-2 text-sm text-gray-600">
        Selecciona un archivo GLB para importar.
      </p>
    </div>
  );
};

export default GLBImporter;
