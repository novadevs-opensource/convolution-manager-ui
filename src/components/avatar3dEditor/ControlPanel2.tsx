import React from 'react';
import { AvatarState, AvatarStateContextType } from './useAvatarState';
import { DropdownSelector } from './controls/DropdownSelector';
import { ColorSelector } from './controls/ColorSelector';

interface ControlPanelProps {
  avatarState: AvatarStateContextType;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  avatarState
}) => {
  return (
    <div className="w-full md:w-1/3 bg-gray-100 rounded-lg p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "500px" }}>
      <h2 className="text-lg font-semibold border-b pb-2">Personalización</h2>
      
      <DropdownSelector
        label="Modelo Base"
        value={avatarState.baseModel}
        onChange={(value) => avatarState.updateState('baseModel', value as any)}
        options={[
          { value: 'funko', label: 'Funko Pop' }
        ]}
      />

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-md font-medium mb-2 text-blue-800">Pelo</h3>
        <DropdownSelector
          label="Estilo de Pelo"
          value={avatarState.hairStyle}
          onChange={(value) => avatarState.updateState('hairStyle', value as any)}
          options={[
            { value: 'long', label: 'Largo (Afro)' },
            { value: 'short', label: 'Corto' },
            { value: 'ponytail', label: 'Coleta' },
            { value: 'pigtails', label: 'Coletas' }
          ]}
        />
        <ColorSelector
          label="Color de Pelo"
          value={avatarState.hairColor}
          onChange={(value) => avatarState.updateState('hairColor', value)}
        />
      </div>

      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <h3 className="text-md font-medium mb-2 text-purple-800">Accesorios</h3>
        <DropdownSelector
          label="Accesorio"
          value={avatarState.accessory}
          onChange={(value) => avatarState.updateState('accessory', value as any)}
          options={[
            { value: 'none', label: 'Ninguno' },
            { value: 'glasses', label: 'Gafas' },
            { value: 'hat', label: 'Sombrero' },
            { value: 'bow', label: 'Lazo' }
          ]}
        />
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <ColorSelector
          label="Color de Ojos"
          value={avatarState.eyeColor}
          onChange={(value) => avatarState.updateState('eyeColor', value)}
        />
        <ColorSelector
          label="Tono de Piel"
          value={avatarState.skinColor}
          onChange={(value) => avatarState.updateState('skinColor', value)}
        />
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <DropdownSelector
          label="Estilo de Ropa"
          value={avatarState.outfitStyle}
          onChange={(value) => avatarState.updateState('outfitStyle', value as any)}
          options={[
            { value: 'casual', label: 'Casual' },
            { value: 'formal', label: 'Formal' },
            { value: 'uniform', label: 'Uniforme' }
          ]}
        />
        <ColorSelector
          label="Color de Ropa"
          value={avatarState.outfitColor}
          onChange={(value) => avatarState.updateState('outfitColor', value)}
        />
        <DropdownSelector
          label="Expresión"
          value={avatarState.expression}
          onChange={(value) => avatarState.updateState('expression', value as any)}
          options={[
            { value: 'neutral', label: 'Neutral' },
            { value: 'happy', label: 'Feliz' },
            { value: 'sad', label: 'Triste' },
            { value: 'angry', label: 'Enfadado' }
          ]}
        />
      </div>
    </div>
  );
};
