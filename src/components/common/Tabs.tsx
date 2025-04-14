import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  className?: string;
  tabsContainerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  className = '',
  tabsContainerClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  contentClassName = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab || (tabs.length > 0 ? tabs[0].id : ''));

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Si no hay tabs, no mostrar nada
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Contenedor de las pestañas */}
      <div className={`flex ${tabsContainerClassName}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              px-4 py-3 text-2xl font-bold font-anek-latin transition-colors border-b-2 border-[transparent]
              ${activeTab === tab.id
                ? `!border-blue-500 text-black ${activeTabClassName}`
                : `text-gray-400 hover:text-gray-700 hover:border-gray-300 ${tabClassName}`
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <div className="flex items-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className={`py-4 ${contentClassName}`}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;