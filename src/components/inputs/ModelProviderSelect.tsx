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
  required?: boolean;
  hasError?: boolean;
  errorMessages?: Array<string>;
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
    <div className="flex flex-row gap-2 items-center ml-2">
      <span>{option.label}</span>
      <span className="font-bold text-beige-600">
        {option.isFree ? '[FREE]' : '[PAID]'}
      </span>
    </div>
  );

  const formatGroupLabel = (group: any) => (
    <span className="font-bold text-lg text-black">
      {group.label}
    </span>
  );

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

  const renderErrorMessages = () => {
    if (errorMessages.length > 0) {
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
      {renderLabel()}
      
      <Select<OptionType, false, GroupBase<OptionType>>
        value={selectedOption}
        onChange={handleChange}
        options={groupedOptions}
        placeholder="Select a model"
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
              : 'none',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            borderRadius: '0.375rem',
            minHeight: '2.5rem',
            transition: 'all 0.2s ease',
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: '1rem',
            color: 'E6B97F'
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

export default ModelProviderSelect;
