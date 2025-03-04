import React from 'react'

const Header: React.FC<{title: string}> = ({ title }) => (
  
  <div className="bg-white rounded-lg p-4 mb-4 border flex-grow">
    <h1 className="text-2xl font-semibold font-anek-latin">{title}</h1>
  </div>
)

export default Header;