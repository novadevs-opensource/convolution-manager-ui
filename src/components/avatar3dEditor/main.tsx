import React from 'react';
import { useAvatarState } from './useAvatarState';

import { AvatarBuilder } from './AvatarBuilder';
import { exportAvatar, importAvatar } from './exportImport/avatarExport';
import { AvatarCanvas } from './AvatarCanvas2';
import { ControlPanel } from './ControlPanel2';

const AvatarEditor: React.FC = () => {
  const avatarState = useAvatarState();

  const handleExport = () => {
    const data = exportAvatar(avatarState);
    console.log('Avatar exportado:', data);
    // Aquí podrías descargar el JSON o enviarlo a un backend
  };

  const handleImport = async (file: File) => {
    try {
      const importedState = await importAvatar(file);
      // Actualizar el estado según la configuración importada
      // Ejemplo:
      // avatarState.updateState('hairStyle', importedState.hairStyle);
      console.log('Avatar importado:', importedState);
    } catch (error) {
      console.error('Error al importar:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Editor de Avatares 3D</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <AvatarCanvas avatarState={avatarState} builder={AvatarBuilder} />
        <ControlPanel avatarState={avatarState} />
      </div>
      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Exportar Avatar
        </button>
        <input 
          type="file" 
          accept=".json,.glb" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleImport(e.target.files[0]);
            }
          }}
          className="border p-2 rounded"
        />
      </div>
    </div>
  );
};

export default AvatarEditor;
