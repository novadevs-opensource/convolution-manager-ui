import React from 'react';
import Select, { GroupBase, SingleValue } from 'react-select';
import { OpenRouterModel } from '../../types';

interface OptionType {
  label: string;
  value: string;
  group: string;
  isFree: boolean;
}

interface ModelProviderSelectProps {
  selected: string;
  onChange: (value: string) => void;
  models: OpenRouterModel[];
  label?: string;
  required?: boolean; // Añadido para mantener consistencia con GenericTextInput
  hasError?: boolean; // Añadido para mantener consistencia con GenericTextInput
  errorMessages?: Array<string>; // Añadido para mantener consistencia con GenericTextInput
}

const ModelProviderSelect: React.FC<ModelProviderSelectProps> = ({ 
  selected, 
  onChange, 
  models, 
  label,
  required = false,
  hasError = false,
  errorMessages = [] 
}) => {
  // Mapea cada modelo a una opción con su grupo y si es gratis o no
  const options: OptionType[] = models.map((model) => {
    const group = `${model.id.split('/')[0]} models`;
    const isFree =
      model.pricing.completion === "0" &&
      model.pricing.image === "0" &&
      model.pricing.request === "0";
    return {
      label: model.name.replace(/^.*?:\s*/, '').split('(free)')[0],
      value: model.id,
      group,
      isFree,
    };
  });

  // Agrupa las opciones por el campo "group"
  const groupedOptions: GroupBase<OptionType>[] = Object.entries(
    options.reduce((acc: Record<string, OptionType[]>, option) => {
      if (!acc[option.group]) {
        acc[option.group] = [];
      }
      acc[option.group].push(option);
      return acc;
    }, {})
  ).map(([group, options]) => ({
    label: group,
    options,
  }));

  const selectedOption = options.find((option) => option.value === selected) || null;

  const handleChange = (option: SingleValue<OptionType>) => {
    onChange(option ? option.value : '');
  };

  const formatOptionLabel = (option: OptionType) => (
    <div className='flex flex-row gap-2 items-center ml-2'>
      <span>
        {option.label}
      </span>
      <span className='font-bold text-gray-400'>
        {option.isFree ? '[FREE]' : '[PAID]'}
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
        <label className="block text-lg mb-1">
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
        options={groupedOptions}
        placeholder="Select a model"
        isClearable
        formatOptionLabel={formatOptionLabel}
        formatGroupLabel={formatGroupLabel}
        classNames={{
          control: (state) => `!border-${hasError ? 'red' : 'gray'}-${hasError ? '500' : '300'} !rounded-md bg-white ${state.isFocused ? `!border-${hasError ? 'red' : 'blue'}-500 !shadow-sm` : ''}`,
          placeholder: () => '!text-base',
          singleValue: () => '!-ml-2',
          valueContainer: () => '',
          container: () => hasError ? 'border-red-500' : '',
        }}
      />
      
      {hasError && renderErrorMessages()}
    </div>
  );
};

export default ModelProviderSelect;
