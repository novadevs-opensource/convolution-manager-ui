import React, { useEffect } from 'react';
import { Agent } from '../../types';
import AgentCard from './AgentCard';

// Interface for the main component props
interface MasonryAgentsLayoutProps {
  agents: Agent[];
  className?: string;
  columns?: number;
  scroll?: boolean;
  scrollSize?: number;
}

// Main component with TypeScript typing
const StyledMasonryAgentsLayout: React.FC<MasonryAgentsLayoutProps> = ({ 
  agents, 
  className = "",
  columns = 1,
  scroll,
  scrollSize,
}) => {
  useEffect(() => {
    if (scroll && !scrollSize) {
      console.error('You need to set "scrollSize prop" when you are using "scroll" prop');
    }
  }, [scroll, scrollSize]);
  
  // Distribute agents into columns to create the masonry effect
  const distributeIntoColumns = (): Agent[][] => {
    const columnArrays: Agent[][] = Array.from({ length: columns }, () => []);
    
    agents.forEach((agent, index) => {
      // Distribute into columns in an alternating pattern
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(agent);
    });
    
    return columnArrays;
  };
  
  const columnData = distributeIntoColumns();
  
  // Determinar la clase de grid basada en el número de columnas
  const getGridColumnsClass = () => {
    // Por defecto para dispositivos móviles siempre es 1 columna
    // Para md y lg, usar el número de columnas proporcionado
    switch (columns) {
      case 1:
        return "md:grid-cols-1";
      case 2:
        return "md:grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 4:
        return "md:grid-cols-4";
      case 5:
        return "md:grid-cols-5";
      case 6:
        return "md:grid-cols-6";
      default:
        return "md:grid-cols-3"; // Valor por defecto si columns es un número no esperado
    }
  };
  
  // Render all agents in a responsive layout for mobile
  const renderAllAgents = () => {
    // Convert the column arrays into a flat array of all agents
    const allAgents: Array<{agent: Agent, columnIndex: number, agentIndex: number}> = [];
    
    columnData.forEach((column, columnIndex) => {
      column.forEach((agent, agentIndex) => {
        allAgents.push({
          agent,
          columnIndex,
          agentIndex
        });
      });
    });
    
    return (
      <>
        {allAgents.map((item) => (
          <AgentCard 
            agent={item.agent} 
            key={`mobile-${item.columnIndex}-${item.agentIndex}`} 
          />
        ))}
      </>
    );
  };
  
  // Obtener la clase de grid según el número de columnas
  const gridColumnsClass = getGridColumnsClass();
  
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {scroll ? (
        <div className="overflow-y-hidden" style={{height: scrollSize}}>
          <div className="overflow-y-scroll" style={{height: scrollSize}}>
            {/* Mobile layout: one agent per row */}
            <div className="flex flex-col w-full md:hidden">
              {renderAllAgents()}
            </div>
            
            {/* Masonry layout for tablets and desktop con número de columnas dinámico */}
            <div className={`hidden md:grid ${gridColumnsClass} gap-6`}>
              {columnData.map((column, columnIndex) => (
                <div key={`column-${columnIndex}`} className="flex flex-col gap-2">
                  {column.map((agent, agentIndex) => (
                    <AgentCard 
                      agent={agent} 
                      key={`desktop-${columnIndex}-${agentIndex}`} 
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile layout: one agent per row */}
          <div className="flex flex-col w-full md:hidden">
            {renderAllAgents()}
          </div>
            
          {/* Masonry layout for tablets and desktop con número de columnas dinámico */}
          <div className={`hidden md:grid ${gridColumnsClass} gap-6`}>
            {columnData.map((column, columnIndex) => (
              <div key={`column-${columnIndex}`} className="flex flex-col">
                {column.map((agent, agentIndex) => (
                  <AgentCard 
                    agent={agent}
                    key={`desktop-${columnIndex}-${agentIndex}`} 
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StyledMasonryAgentsLayout;