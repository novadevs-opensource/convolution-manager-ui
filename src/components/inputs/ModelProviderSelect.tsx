// src/components/ModelProviderSelect.tsx
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
}

const ModelProviderSelect: React.FC<ModelProviderSelectProps> = ({ selected, onChange, models }) => {
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
    <div>
      <span style={{ marginLeft: '.5em', fontSize: '0.8em'}}>
        {option.label}
      </span>
      <span style={{ marginLeft: '1em', fontSize: '0.6em', color: 'gray', fontWeight: option.isFree ? 'bold' : 'normal'}}>
        {option.isFree ? '[FREE]' : '[PAID]'}
      </span>
    </div>
  );
  
  const formatGroupLabel = (group: any) => (
      <span style={{fontSize: '1em', color: 'black', fontWeight: 'bolder' }}>
        {group.label}
      </span>
  );

  return (
    <Select<OptionType, false, GroupBase<OptionType>>
      value={selectedOption}
      onChange={handleChange}
      options={groupedOptions}
      placeholder="Select a model"
      isClearable
      formatOptionLabel={formatOptionLabel}
      formatGroupLabel={formatGroupLabel}
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: 'var(--color-surface)',
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: 'var(--color-surface)',
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '0.85em',
        }),
      }}
    />
  );
};

export default ModelProviderSelect;
