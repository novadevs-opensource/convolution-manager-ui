// src/utils/character.ts
export function splitIntoSentences(text: string): string[] {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return [];
  }
  // Si hay saltos de línea, usamos esos para separar las oraciones
  if (text.includes('\n')) {
    return text
      .split('\n')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.endsWith('.') ? sentence : sentence);
  }
  // Si no hay saltos de línea, separamos por puntuación
  return text
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
    .map(sentence => sentence);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}