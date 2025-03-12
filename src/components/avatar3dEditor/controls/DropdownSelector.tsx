import React from 'react';

interface OptionType {
  value: string;
  label: string;
}

interface DropdownSelectorProps {
  label: string;
  value: string;
  options: OptionType[];
  onChange: (value: string) => void;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({ 
  label, 
  value, 
  options, 
  onChange 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select 
        className="w-full p-2 border rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
