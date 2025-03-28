import React, { useState, ReactNode } from 'react';

// Tipo para un item de acordeón
interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isFirstItem: boolean;
  isLastItem: boolean;
}

// Componente de item de acordeón
const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  isOpen, 
  onToggle,
  isLastItem,  
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={`flex cursor-pointer items-center justify-between rounded-md bg-gray-200 px-4 py-2`}
        onClick={onToggle}
      >
        <span className='font-anek-latin'>{title}</span>
        <i className={`fa fa-chevron-down transition-all duration-500 ${isOpen ? '-rotate-180' : ''}`}></i>
      </div>
      <div 
        className={`overflow-hidden transition-all duration-500 -mt-2 mb-2 ${
          isOpen 
            ? 'opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        }`}
      >
        <div className={`px-4 py-2 border-t-0  bg-white ${isLastItem ? 'rounded-b-md' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Tipo para los items del acordeón
export interface AccordionItem {
  title: string;
  content: ReactNode;
}

// Tipo para las props del acordeón
interface AccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number | null;
  allowMultiple?: boolean;
}

// Componente de acordeón principal
const Accordion: React.FC<AccordionProps> = ({ 
  items, 
  defaultOpenIndex = null,
  allowMultiple = false
}) => {
  // Si allowMultiple es true, guardamos un array de índices abiertos
  // Si no, guardamos un solo índice o null
  const [openIndices, setOpenIndices] = useState<number[] | number | null>(
    allowMultiple 
      ? defaultOpenIndex !== null ? [defaultOpenIndex] : []
      : defaultOpenIndex
  );

  const toggleAccordion = (index: number) => {
    if (allowMultiple) {
      // TypeScript entiende que openIndices es un array en este caso
      setOpenIndices((prevIndices) => {
        const currentIndices = prevIndices as number[];
        return currentIndices.includes(index)
          ? currentIndices.filter((i) => i !== index)
          : [...currentIndices, index];
      });
    } else {
      // TypeScript entiende que openIndices es un número o null en este caso
      setOpenIndices((prevIndex) => 
        prevIndex === index ? null : index
      );
    }
  };

  const isItemOpen = (index: number) => {
    if (allowMultiple) {
      return (openIndices as number[]).includes(index);
    } else {
      return openIndices === index;
    }
  };

  return (
    <div className="accordion-container">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={isItemOpen(index)}
          onToggle={() => toggleAccordion(index)}
          index={index}
          isFirstItem={index === 0}
          isLastItem={index === items.length - 1}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;