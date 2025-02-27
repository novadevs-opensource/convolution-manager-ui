// CharacterResultSection.tsx
import React, { useState } from 'react';
import { CharacterData } from '../../types';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';

interface CharacterResultSectionProps {
  character: CharacterData;
}

const CharacterResultSection: React.FC<CharacterResultSectionProps> = ({ character }) => {
  const [resultJson, setResultJson] = useState<string>('');
  const [downloadDisabled, setDownloadDisabled] = useState<boolean>(true);

  // Esta función se invoca al hacer clic en "Generate Character"
  const handleGenerateJson = () => {
    // Si necesitas transformar o complementar la data, hazlo aquí.
    // En este ejemplo usamos el objeto character tal cual.
    const generatedCharacter = { ...character };

    // Convertimos a JSON con formato
    const json = JSON.stringify(generatedCharacter, null, 2);
    setResultJson(json);
    setDownloadDisabled(false);

    // Opcional: scroll suave al área de resultado
    const knowledgeContent = document.getElementById('knowledge-content');
    if (knowledgeContent) {
      knowledgeContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Función para descargar el JSON resultante
  const handleDownloadJson = () => {
    const blob = new Blob([resultJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Usa el nombre del character si está definido, o un nombre por defecto
    const fileName = (character.name ? character.name : 'character') + '.json';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <CharacterEditorSection
      title={'Character Result'}
      headerIcon={
        <button
          className="icon-button help-button"
          title="Generate and download the final character JSON"
        >
          <i className="fa-solid fa-code"></i>
        </button>
      }
    >
      <FormGroup>
        <div className="result-controls">
          <Button onClick={handleGenerateJson} label={'Generate'} icon='fa-bolt'/>
          <Button onClick={handleDownloadJson} label='Download' disabled={downloadDisabled} icon='fa-download'/>
        </div>
        <div id="knowledge-content" className="debug-output">
          {/* Mostramos el JSON resultante en un bloque <pre> */}
          <pre>{resultJson}</pre>
        </div>
      </FormGroup>
    </CharacterEditorSection>
  );
};

export default CharacterResultSection;
