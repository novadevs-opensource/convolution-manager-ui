// src/components/Sidebar.tsx
import React from 'react';
import LoadCharacterSection from './LoadCharacterSection';
import GenerateCharacterSection from './GenerateCharacterSection';
import { BackupListItem } from '../../types';

interface SidebarProps {
  onLoadCharacter: (character: any) => void; // Reemplaza "any" por tu tipo CharacterData si lo tienes definido
  backups: BackupListItem[];
  onSaveBackup: (name: string) => void;
  onLoadBackup: (name: string) => void;
  onRenameBackup: (oldName: string, newName: string) => void;
  onDeleteBackup: (name: string) => void;
  onGenerateCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
  onRefineCharacter: (prompt: string, model: string, apiKey: string) => Promise<void>;
  agentSeedPrompt?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onLoadCharacter,
  backups,
  onSaveBackup,
  onLoadBackup,
  onRenameBackup,
  onDeleteBackup,
  onGenerateCharacter,
  agentSeedPrompt,
}) => {
  return (
    <div className="w-full">
      <GenerateCharacterSection
        onGenerateCharacter={onGenerateCharacter}
        savedPrompt={agentSeedPrompt}
      />
      <LoadCharacterSection
        onLoadCharacter={onLoadCharacter}
        backups={backups}
        onSaveBackup={onSaveBackup}
        onLoadBackup={onLoadBackup}
        onRenameBackup={onRenameBackup}
        onDeleteBackup={onDeleteBackup}
      />
    </div>
  );
};

export default Sidebar;
