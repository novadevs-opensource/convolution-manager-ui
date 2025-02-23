// src/utils/storage.ts
import { BACKUP_KEY_PREFIX, DEFAULT_BACKUP_NAME } from '../constants';
import { Backup, CharacterData } from '../types';

export function saveBackup(data: CharacterData, name: string = DEFAULT_BACKUP_NAME): void {
  const backup: Backup = {
    name: name || DEFAULT_BACKUP_NAME,
    timestamp: new Date().toISOString(),
    data
  };
  const key = BACKUP_KEY_PREFIX + (name || DEFAULT_BACKUP_NAME).replace(/\s+/g, '_').toLowerCase();
  localStorage.setItem(key, JSON.stringify(backup));
}

export function loadBackup(name: string = DEFAULT_BACKUP_NAME): Backup | null {
  const key = BACKUP_KEY_PREFIX + name.replace(/\s+/g, '_').toLowerCase();
  const backupJson = localStorage.getItem(key);
  if (backupJson) {
    try {
      return JSON.parse(backupJson);
    } catch (error) {
      console.error('Error loading backup:', error);
      return null;
    }
  }
  return null;
}

export function getAllBackups(): Backup[] {
  const backups: Backup[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(BACKUP_KEY_PREFIX)) {
      try {
        const backup = JSON.parse(localStorage.getItem(key) || '');
        backups.push(backup);
      } catch (error) {
        console.error('Error loading backup:', error);
      }
    }
  }
  return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}