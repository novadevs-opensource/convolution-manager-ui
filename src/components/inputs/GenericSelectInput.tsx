import React, { useState } from 'react';
import Select, { GroupBase, SingleValue } from 'react-select';

interface OptionType {
  label: string;
  value: string;
  group?: string;
}

interface ModelProviderSelectProps {
  selected: string;
  onChange: (value: string) => void;
  values: OptionType[];
  label?: string;
  required?: boolean; // Añadido para mantener consistencia con GenericTextInput
  hasError?: boolean; // Añadido para mantener consistencia con GenericTextInput
  errorMessages?: Array<string>; // Añadido para mantener consistencia con GenericTextInput
  grouped?: boolean
}

const GenericSelectInput: React.FC<ModelProviderSelectProps> = ({ 
  selected, 
  onChange, 
  values, 
  label,
  required = false,
  hasError = false,
  errorMessages = [],
  grouped = false,
}) => {
  const [groupedOptions, setGroupedOptions] = useState<GroupBase<OptionType>[]>()
  // Mapea cada modelo a una opción con su grupo y si es gratis o no
  const options: OptionType[] = values;

  // Agrupa las opciones por el campo "group"
  if (grouped) {
    const groupedOptions: GroupBase<OptionType>[] = Object.entries(
      options.reduce((acc: Record<string, OptionType[]>, option) => {
        if (option.group) {
          if (!acc[option.group]) {
            acc[option.group] = [];
          }
          acc[option.group].push(option);
          return acc;
        } else {
          return acc;
        }
      }, {})
    ).map(([group, options]) => ({
      label: group,
      options,
    }));
    setGroupedOptions(groupedOptions)
  }

  const selectedOption = options.find((option) => option.value === selected) || null;

  const handleChange = (option: SingleValue<OptionType>) => {
    onChange(option ? option.value : '');
  };

  const formatOptionLabel = (option: OptionType) => (
    <div className='flex flex-row gap-2 items-center ml-2'>
      <span>
        {option.label}
      </span>
    </div>
  );
  
  const formatGroupLabel = (group: any) => (
    <span className='font-bold text-lg text-black'>
      {group.label}
    </span>
  );

  // Renderiza el label con el asterisco si es requerido
  const renderLabel = () => {
    if (label) {
      return (
        <label className="block font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      );
    }
    return null;
  };

  // Renderiza los mensajes de error
  const renderErrorMessages = () => {
    if (errorMessages && errorMessages.length > 0) {
      return (
        <div className="mt-1">
          {errorMessages.map((error, index) => (
            <div key={index} className="text-sm text-red-500 mt-1">{error}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mb-4">
      {label && (
        <div className="flex justify-between items-center">
          {renderLabel()}
        </div>
      )}
      
      <Select<OptionType, false, GroupBase<OptionType>>
        value={selectedOption}
        onChange={handleChange}
        options={groupedOptions ?? options}
        placeholder="Select an option"
        isClearable
        formatOptionLabel={formatOptionLabel}
        formatGroupLabel={formatGroupLabel}
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: '#FFF4E3',
            border: hasError
              ? '1px solid #ef4444' // red-500
              : state.isFocused
              ? '1px solid #3b82f6' // blue-500
              : '1px solid #FFF4E3',
            boxShadow: state.isFocused
              ? '0 0 0 1px #3b82f6' // emula `ring-1 ring-blue-500`
              : 'none',
            borderRadius: '0.375rem', // rounded-md
            minHeight: '2.5rem', // para no colapsar
            transition: 'all 0.2s ease',
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: '1rem',
          }),
          singleValue: (base) => ({
            ...base,
            marginLeft: '-0.5rem',
          }),
          valueContainer: (base) => ({
            ...base,
            paddingLeft: '0.5rem',
          }),
          container: (base) => ({
            ...base,
            width: '100%',
          }),
        }}
      />

      
      {hasError && renderErrorMessages()}
    </div>
  );
};

export default GenericSelectInput;
