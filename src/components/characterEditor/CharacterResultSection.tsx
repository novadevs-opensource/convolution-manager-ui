// CharacterResultSection.tsx
import React, { useState } from 'react';
import { CharacterData } from '../../types';
import CharacterEditorSection from './CharacterEditorSection';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';

interface CharacterResultSectionProps {
  character: CharacterData;
  forWizard?: boolean;
}

const CharacterResultSection: React.FC<CharacterResultSectionProps> = ({ character, forWizard }) => {
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

  if (forWizard) {
    return (
      <FormGroup className='!mb-0'>
        <div className="flex flex-row gap-2">
          <Button onClick={handleGenerateJson} label={'Reveal settings in JSON format'} icon='fa-bolt'/>
          <Button onClick={handleDownloadJson} label='Download' disabled={downloadDisabled} icon='fa-download'/>
        </div>
        {resultJson &&
            <div id="knowledge-content" className="debug-output flex flex-col gap-4 mt-4">
              <div className='mt-4 flex flex-row gap-2 items-center bg-red-100 rounded-md p-2'>
                <i className='fa fa-warning rounded-full border-2 p-1 text-white bg-red-500 border-red-700'></i>
                <span className='text-red-600 font-anek-latin'><b>Caution!</b> Your <b>credentials</b> might be here. <b>Use this data responsibly.</b></span>
              </div>
              <pre className='bg-white rounded-lg p-4 text-xs'>{resultJson}</pre>
            </div>
        }
      </FormGroup>
    )
  }

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
          <Button onClick={handleGenerateJson} label={'Generate JSON preview'} icon='fa-bolt'/>
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
