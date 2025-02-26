// src/utils/character.ts
export function splitIntoSentences(text: string): string[] {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return [];
  }

  if (text.includes('\n')) {
    return text
      .split('\n')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.endsWith('.') ? sentence : sentence);
  }

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

export function formatDateFromString(date: string): string {
  const dateObj = new Date(date);

  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    timeZone: 'GMT'
  };
  
  let dateWithFormat = dateObj.toLocaleDateString('en-US', options).replace(',', '');
  
  const hour = dateObj.getUTCHours().toString().padStart(2, '0');
  const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
  return dateWithFormat + ' ' + hour + ':' + minutes + ' GMT';
}

/**
 * Generates a random integer between min and max (both inclusive)
 * @param min The minimum value (inclusive)
 * @param max The maximum value (inclusive)
 * @returns A random integer between min and max
 */
export function getRandomInt(min: number, max: number): number {
  // Ensure min and max are integers
  min = Math.ceil(min);
  max = Math.floor(max);
  
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}