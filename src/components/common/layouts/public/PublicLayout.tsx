// src/components/layouts/PublicLayout.tsx
import React from 'react'


type LayoutProps = {
  children: React.ReactNode
}

const PublicLayout: React.FC<LayoutProps> = ({ children }) => {


  return (
    <div className="w-full">
        {children}
    </div>
  )
}

export default PublicLayout
