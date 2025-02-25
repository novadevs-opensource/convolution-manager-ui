// src/components/common/SectionContainer.tsx
import React, { ReactNode } from 'react';

interface SectionContainerProps {
  id: string;
  title: string;
  helpTitle?: string;
  icon?: string;
  children: ReactNode;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  id,
  title,
  helpTitle,
  icon = 'fa-arrow-trend-up',
  children
}) => {
  return (
    <section className="section shadow-md" id={id}>
      <div className="section-header rounded-t-lg">
        <span>{title}</span>
        {helpTitle && (
          <button
            className="icon-button help-button"
            title={helpTitle}
          >
            <i className={`fa-solid ${icon}`}></i>
          </button>
        )}
      </div>
      <div className="section-content rounded-b-lg">
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;