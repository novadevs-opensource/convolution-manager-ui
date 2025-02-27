// src/components/characterEditor/LoadCharacterSection.tsx
import React, { useRef, useState } from 'react';
import { BackupListItem } from '../../types';
import CharacterEditorSection from './CharacterEditorSection';

interface LoadCharacterSectionProps {
  onLoadCharacter: (character: any) => void; // Idealmente usarías el tipo CharacterData
  backups: BackupListItem[];
  onSaveBackup: (name: string) => void;
  onLoadBackup: (name: string) => void;
  onRenameBackup: (oldName: string, newName: string) => void;
  onDeleteBackup: (name: string) => void;
}

const LoadCharacterSection: React.FC<LoadCharacterSectionProps> = ({
  onLoadCharacter,
  /*
  backups = [],
  onSaveBackup,
  onLoadBackup,
  onRenameBackup,
  onDeleteBackup,
  */
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>('');
  //const [backupName, setBackupName] = useState<string>('');

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/json') {
      setStatus('Please select a JSON file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const character = JSON.parse(reader.result as string);
        // Forzamos que ciertos campos estén definidos como arrays
        const loadedCharacter = {
          ...character,
          adjectives: Array.isArray(character.adjectives) ? character.adjectives : [],
          people: Array.isArray(character.people) ? character.people : [],
          // Puedes hacer lo mismo para otros campos si es necesario
        };
        onLoadCharacter(loadedCharacter);
        setStatus('Character loaded successfully!');
      } catch (err: any) {
        setStatus('Error parsing JSON: ' + err.message);
      }
    };
    reader.onerror = () => {
      setStatus('Error reading file');
    };
    reader.readAsText(file);
  };

  return (
    <CharacterEditorSection
      title={'Restore character'}
      headerIcon={
        <button className="icon-button help-button" title="Drop or select a character JSON file to load an existing character">
          <i className="fa-solid fa-file-import"></i>
        </button>
      }
    >
      <div
        className="drop-zone rounded-lg p-8"
        id="character-drop-zone"
        onDrop={handleFileDrop}
        onDragOver={handleFileDrop}
      >
        <div className="drop-zone-content">
          <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
          <p>Drag and drop a character JSON file here</p>
          <input
            type="file"
            id="character-file-input"
            accept=".json"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div id="character-file-status" className="success">
        {status}
      </div>
      {/* 
      <div className="backup-management">
        <h3 className='my-4'>Saved Backups</h3>
        <div className="backup-controls">
          <input
            type="text"
            id="new-backup-name"
            placeholder="Backup name"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
          />
          <button
            onClick={() => {
              onSaveBackup(backupName);
              setBackupName('');
            }}
            className="primary-button"
          >
            <i className="fa-solid fa-floppy-disk"></i> Save New
          </button>
        </div>
        <div id="backup-list" className="backup-list">
          {(backups || []).map((backup) => (
            <div key={backup.key} className="backup-item">
              <input
                type="text"
                className="backup-name"
                defaultValue={backup.name}
                title={backup.timestamp}
                onBlur={(e) => onRenameBackup(backup.name, e.target.value)}
              />
              <button
                onClick={() => onLoadBackup(backup.name)}
                className="action-button load-button"
                title="Load backup"
              >
                <i className="fa-solid fa-folder-open"></i>
              </button>
              <button
                onClick={() => onDeleteBackup(backup.name)}
                className="action-button delete-button"
                title="Delete backup"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
      */}
    </CharacterEditorSection>
  );
};

export default LoadCharacterSection;
