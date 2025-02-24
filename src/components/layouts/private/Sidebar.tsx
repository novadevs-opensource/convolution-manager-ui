// src/components/layouts/private/Sidebar.tsx
import React from 'react'
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

type SidebarProps = {
    menuItems: { name: string; path: string }[]
  }
  
  const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
    const { isAuthenticated, logout } = useAuth()
  
    return (
      <aside className="bg-white max-w-[300px] w-2/12 min-h-screen p-4 flex flex-col border-r border-r-black-50">
        {/* logo */}
        <div className="p-2 flex items-center justify-center mb-8">
          <img
            src="https://staging.convolution.agency/assets/convolution-logo-main-DniIUzDJ.svg"
            alt="Logo"
            className="h-12"
          />
        </div>
        {/* menu */}
        <div className='flex flex-col justify-between flex-grow'>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-4 py-2 hover:bg-black hover:text-white rounded-full ease-in-out duration-300 font-bold"
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
                  title="Convolution Main Repository"
                  rel="noopener"
                  onClick={logout}
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