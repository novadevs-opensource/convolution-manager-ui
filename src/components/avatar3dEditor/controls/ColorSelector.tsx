import React from 'react';

interface ColorSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  label, 
  value, 
  onChange 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 p-1 border rounded"
      />
    </div>
  );
};
