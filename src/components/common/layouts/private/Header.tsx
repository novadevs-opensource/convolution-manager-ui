import React from 'react'

const Header: React.FC<{title: string}> = ({ title }) => (
  
  <div className="bg-clouds-pattern rounded-lg p-4 mb-4 flex flex-row flex-grow justify-between items-center">
    <h1 className="text-black text-2xl font-semibold font-anek-latin">{title}</h1>
    <a 
      href={import.meta.env.VITE_DOC_URL}
      target='_blank'
      className='w-8 h-8 rounded-full shadow-md items-center justify-center flex bg-black text-white hover:bg-yellow-500 hover:text-black cursor-pointer'
    >
      <i className='fa fa-question'></i>
    </a>
  </div>
)

export default Header;