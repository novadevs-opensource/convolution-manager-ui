// src/components/characterEditor/KnowledgeProcessingSection.tsx
import React, { useState, useRef } from 'react';
import CharacterEditorSection from './CharacterEditorSection';
import Button from '../common/Button';
import GenericTextInput from '../inputs/GenericTextInput';

interface KnowledgeProcessingSectionProps {
  knowledge: string[];
  onKnowledgeChange: (newKnowledge: string[]) => void;
  forWizard?: boolean; 
}

const KnowledgeProcessingSection: React.FC<KnowledgeProcessingSectionProps> = ({
  knowledge,
  onKnowledgeChange,
  forWizard = false,
}) => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [statusClass, setStatusClass] = useState<'error' | 'success' | ''>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejadores para el drop zone y file input
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setFileList(prev => [...prev, ...files]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFileList(prev => [...prev, ...files]);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Manejador para procesar archivos (por ejemplo, enviando a la API)
  const handleProcessKnowledge = async () => {
    if (fileList.length === 0) {
      setProcessingStatus('No files to process');
      setStatusClass('error');
      return;
    }
    setProcessingStatus('Processing knowledge files...');
    setStatusClass('');
    setProcessing(true);

    try {
      const formData = new FormData();
      fileList.forEach(file => {
        formData.append('files', file);
      });
      // Aquí se hace la llamada a la API (cambia la URL según corresponda)
      const response = await fetch(`${process.env.HOST}:${process.env.PORT}/api/process-files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Se espera { knowledge: string[] }
      const newKnowledge: string[] = data.knowledge || [];
      // Combina el conocimiento existente con el nuevo
      const combinedKnowledge = [...knowledge, ...newKnowledge];
      onKnowledgeChange(combinedKnowledge);

      setFileList([]); // Limpia la lista de archivos
      setProcessingStatus('Knowledge files processed successfully');
      setStatusClass('success');
    } catch (error: any) {
      console.error('Processing error:', error);
      setProcessingStatus(`Error processing knowledge: ${error.message}`);
      setStatusClass('error');
    } finally {
      setProcessing(false);
    }
  };

  // Manejadores para entradas manuales de conocimiento
  // Actualiza el valor en cada pulsación (sin transformación)
  const handleKnowledgeEntryChange = (index: number, value: string) => {
    const updated = [...knowledge];
    updated[index] = value;
    onKnowledgeChange(updated);
  };

  // Cuando se pierde el foco, transforma el texto (añadiendo punto final si hace falta)
  const handleKnowledgeEntryBlur = (index: number, value: string) => {
    let trimmed = value.trim();
    if (trimmed.length > 0 && !/[.!?]$/.test(trimmed)) {
      trimmed += '.';
    }
    const updated = [...knowledge];
    updated[index] = trimmed;
    onKnowledgeChange(updated);
  };

  const handleAddKnowledgeEntry = () => {
    onKnowledgeChange([...knowledge, '']);
  };

  const handleRemoveKnowledgeEntry = (index: number) => {
    const updated = knowledge.filter((_, i) => i !== index);
    onKnowledgeChange(updated);
  };

  if (forWizard) {
    return (
      <div>
        {/* Zona de drop */}
        <div
          className="border-2 border-gray-300 border-dashed rounded-lg p-8 mb-8"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-row items-left items-center gap-2">
            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
            <p className='font-anek-latin'>
              Drag and drop PDF or text files here to add to the character's knowledge base or
            </p>
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              className=""
              title="Select Knowledge Files"
              onClick={handleFileButtonClick}
            >
              <i className="fa-solid fa-folder-open"></i>
            </button>
          </div>
        </div>
        {/* Lista de archivos subidos */}
        <div id="file-list">
          {fileList.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>
        {/* Estado de procesamiento */}
        <div id="processing-status" className={statusClass}>
          {processingStatus}
        </div>

        {/* Botón para procesar archivos */}
        <Button disabled={processing} onClick={handleProcessKnowledge} label={'Generate'} icon='fa-gears'/>

        {/* Visualización y edición del conocimiento */}
        <div className="knowledge-display">
          <div className="knowledge-header">
            <h3 className='text-lg font-bold font-anek-latin'>Knowledge Base <span className='text-sm text-gray-500 font-medium'>({knowledge.length} entries)</span></h3>
            <button
              className="w-10 h-10 bg-yellow-500 hover:bg-black hover:text-white rounded-full border border-yellow-500 hover:border-black border-2"
              title="Add Knowledge Entry"
              onClick={handleAddKnowledgeEntry}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          {knowledge.length > 0 &&
            <div id="knowledge-entries" className="knowledge-entries rounded-lg border-0 p-3">
              {knowledge?.map((entry, index) => (
                <div key={index} className="flex flex-row items-center border-0 mb-4">
                  <span className="entry-number mr-3">{index + 1}.</span>
                  <GenericTextInput
                    type="text"
                    plain={true}
                    containerClassName="!mb-0"
                    className='!w-full'
                    value={entry}
                    placeholder="Enter knowledge..."
                    onChange={(e) => handleKnowledgeEntryChange(index, e.target.value)}
                    onBlur={(e) => handleKnowledgeEntryBlur(index, e.target.value)}
                  />
                  <button
                    className="ml-3 w-11 h-10 bg-yellow-500 hover:bg-black hover:text-white rounded-full border hover:border-black border-2 border-yellow-500"
                    title="Remove Knowledge"
                    onClick={() => handleRemoveKnowledgeEntry(index)}
                  >
                    <i className='fa fa-trash'></i>
                  </button>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    )
  }

  return (
    <CharacterEditorSection
      title={'Knowledge Processing'}
      headerIcon={
        <button className="icon-button help-button" title="Add knowledge to the character by uploading files or entering it manually">
          <i className="fa-solid fa-brain"></i>
        </button>
      }
    >
        {/* Zona de drop */}
        <div
          className="drop-zone knowledge-drop-zone rounded-lg p-8"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-row items-left items-center gap-2">
            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
            <p>
              Drag and drop PDF or text files here to add to the character's knowledge base
            </p>
            <span className="or-divider">or</span>
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              className="action-button"
              title="Select Knowledge Files"
              onClick={handleFileButtonClick}
            >
              <i className="fa-solid fa-folder-open"></i>
            </button>
          </div>
        </div>
        {/* Lista de archivos subidos */}
        <div id="file-list">
          {fileList.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>
        {/* Estado de procesamiento */}
        <div id="processing-status" className={statusClass}>
          {processingStatus}
        </div>
        {/* Botón para procesar archivos */}
        <div className="process-controls">
          <Button disabled={processing} onClick={handleProcessKnowledge} label={'Generate'} icon='fa-gears'/>
        </div>
        {/* Visualización y edición del conocimiento */}
        <div className="knowledge-display">
          <div className="knowledge-header">
            <h3 className='text-lg font-bold'>Knowledge Base</h3>
            <button
              className="action-button add-button border border-gray-300"
              title="Add Knowledge Entry"
              onClick={handleAddKnowledgeEntry}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div id="knowledge-entries" className="knowledge-entries rounded-md">
            {knowledge?.map((entry, index) => (
              <div key={index} className="flex flex-row items-center border-0 mb-4">
                <span className="entry-number mr-3">{index + 1}.</span>
                <GenericTextInput
                  type="text"
                  containerClassName="!mb-0"
                  value={entry}
                  placeholder="Enter knowledge..."
                  onChange={(e) => handleKnowledgeEntryChange(index, e.target.value)}
                  onBlur={(e) => handleKnowledgeEntryBlur(index, e.target.value)}
                />
                <button
                  className="ml-3 action-button delete-button !border border-gray-300"
                  title="Remove Knowledge"
                  onClick={() => handleRemoveKnowledgeEntry(index)}
                >
                  <i className='fa fa-trash'></i>
                </button>
              </div>
            ))}
          </div>
        </div>
    </CharacterEditorSection>
  );
};

export default KnowledgeProcessingSection;
