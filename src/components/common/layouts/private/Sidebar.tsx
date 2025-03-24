// src/components/layouts/private/Sidebar.tsx
import React, { ReactNode } from 'react'
import { Link } from "react-router-dom";
import { useAuth } from '../../../../hooks/useAuth';
import { GrLogout } from "react-icons/gr";
import logoWhite from "../../../../assets/images/convolution-logo-white.svg"


type SidebarProps = {
  menuItems: { name: string; path: string; icon?: ReactNode }[];
  show: boolean;
  onClose: () => void;
}
  
const Sidebar: React.FC<SidebarProps> = ({ menuItems, show, onClose }) => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <aside 
      className={`
        fixed sm:static bg-black sm:max-w-[260px] w-[80%] z-40 
        h-screen flex flex-col transition-transform duration-300 ease-in-out transform
        ${show ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}
    >
      {/* logo */}
      <div className="ml-4 px-4 pr-6 py-4 flex mb-8 justify-between items-baseline">
        <div className='flex flex-col'>
          <img
            src={logoWhite}
            alt="Logo"
            className="h-12 max-w-[190px]"
          />
          <span className='text-white text-xs'>
            <i>v.{__APP_VERSION__}</i>
          </span>
        </div>
        <button 
          className='sm:hidden block bg-dark rounded-lg' 
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-10 h-10">
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
                className="block px-8 py-4 hover:bg-gradient-secondary hover:text-black text-white ease-in-out duration-300"
                onClick={() => {
                  // Cierra el sidebar en móvil al hacer clic en un enlace
                  if (window.innerWidth < 640) {
                    onClose();
                  }
                }}
              >
                <div className='flex flex-row gap-2 items-center uppercase  font-anek-latin text-lg'>
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        
        <div>
          <hr className='mt-8 border-0 h-[2px] bg-gradient-primary'/>
            {isAuthenticated && (
              <div>
                <a
                  className="block px-8 py-4 hover:bg-gradient-secondary hover:text-black text-white ease-in-out duration-300"
                  href="#"
                  title="Logout"
                  rel="noopener"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  <div className='flex flex-row gap-2 items-center uppercase  font-anek-latin text-lg'>
                    <GrLogout />
                    Logout
                  </div>
                </a>
              </div>
            )}
          </div>
      </div>
    </aside>
  )
}

export default Sidebar;