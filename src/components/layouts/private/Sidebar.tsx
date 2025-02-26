// src/components/layouts/private/Sidebar.tsx
import React from 'react'
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

type SidebarProps = {
  menuItems: { name: string; path: string }[];
  show: boolean;
  onClose: () => void;
}
  
const Sidebar: React.FC<SidebarProps> = ({ menuItems, show, onClose }) => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <aside 
      className={`
        fixed sm:static bg-white sm:max-w-[300px] sm:w-2/12 w-[80%] z-40 
        min-h-screen p-4 flex flex-col border-r border-r-black-50 
        transition-transform duration-300 ease-in-out transform
        ${show ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}
    >
      {/* logo */}
      <div className="ml-2 p-2 flex mb-8 justify-between">
        <img
          src="https://staging.convolution.agency/assets/convolution-logo-main-DniIUzDJ.svg"
          alt="Logo"
          className="h-12 max-w-[150px]"
        />
        <button 
          className='sm:hidden block bg-white rounded-lg border p-4 mb-4' 
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* menu */}
      <div className='flex flex-col justify-between flex-grow'>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="block px-4 py-2 hover:bg-black hover:text-white rounded-full ease-in-out duration-300 font-bold"
                onClick={() => {
                  // Cierra el sidebar en móvil al hacer clic en un enlace
                  if (window.innerWidth < 640) {
                    onClose();
                  }
                }}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        
        <div>
          <hr className='my-8'/>
          <ul>
            {isAuthenticated && (
              <a
                className="block px-4 py-2 hover:bg-black hover:text-white rounded-full ease-in-out duration-300 font-bold"
                href="#"
                title="Logout"
                rel="noopener"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                Logout
              </a>
            )}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar;