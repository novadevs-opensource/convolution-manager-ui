// src/components/characterEditor/KnowledgeProcessingSection.tsx
import React, { useState, useRef } from 'react';

interface KnowledgeProcessingSectionProps {
  knowledge: string[];
  onKnowledgeChange: (newKnowledge: string[]) => void;
}

const KnowledgeProcessingSection: React.FC<KnowledgeProcessingSectionProps> = ({
  knowledge,
  onKnowledgeChange,
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
      const response = await fetch('http://0.0.0.0:4001/api/process-files', {
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

  return (
    <section className="section">
      <div className="section-header">
        <span>Knowledge Processing</span>
        <button className="icon-button help-button" title="Add knowledge to the character by uploading files or entering it manually">
          <i className="fa-solid fa-brain"></i>
        </button>
      </div>
      <div className="section-content">
        {/* Zona de drop */}
        <div
          className="drop-zone knowledge-drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
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
          <button
            className="action-button generate-button"
            title="Process Knowledge Files"
            onClick={handleProcessKnowledge}
            disabled={processing}
          >
            <i className="fa-solid fa-gears"></i>
          </button>
        </div>
        {/* Visualización y edición del conocimiento */}
        <div className="knowledge-display">
          <div className="knowledge-header">
            <h3>Knowledge Base</h3>
            <button
              className="action-button add-button"
              title="Add Knowledge Entry"
              onClick={handleAddKnowledgeEntry}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div id="knowledge-entries" className="knowledge-entries">
            {knowledge?.map((entry, index) => (
              <div key={index} className="knowledge-entry">
                <span className="entry-number">{index + 1}.</span>
                <input
                  type="text"
                  className="knowledge-text"
                  value={entry}
                  placeholder="Enter knowledge..."
                  onChange={(e) => handleKnowledgeEntryChange(index, e.target.value)}
                  onBlur={(e) => handleKnowledgeEntryBlur(index, e.target.value)}
                />
                <button
                  className="action-button delete-button"
                  title="Remove Knowledge"
                  onClick={() => handleRemoveKnowledgeEntry(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeProcessingSection;
