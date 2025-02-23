// src/components/inputs/SplitTextArea.tsx
import React, { useState, useEffect } from 'react';
import { splitIntoSentences } from '../../utils/character';

interface SplitTextAreaProps {
  value: string[]; // Valor como array de oraciones
  onChange: (newValue: string[]) => void; // Callback para actualizar el valor (array)
  placeholder?: string;
  id?: string;
  splitOnBlur?: boolean; // Si es true, se aplica splitOnBlur; si es false, se envía el contenido tal cual
}

const SplitTextArea: React.FC<SplitTextAreaProps> = ({
  value,
  onChange,
  placeholder,
  id,
  splitOnBlur = true,
}) => {
  // Estado local para mantener el texto en formato de cadena
  const [text, setText] = useState<string>(value?.join('\n'));

  // Actualiza el estado local si el valor en props cambia (por ejemplo, al cargar un backup)
  useEffect(() => {
    setText(value?.join('\n'));
  }, [value]);

  // En onBlur, se transforma el texto (si corresponde) y se notifica al padre
  const handleBlur = () => {
    if (splitOnBlur) {
      const newArray = splitIntoSentences(text);
      onChange(newArray);
    } else {
      // Si no se desea dividir, se pasa el texto completo como un único elemento del array
      onChange([text]);
    }
  };

  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
    />
  );
};

export default SplitTextArea;
