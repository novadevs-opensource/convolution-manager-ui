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
        <div className="p-2 flex items-center justify-center mb-8">
          <img
            src="https://staging.convolution.agency/assets/convolution-logo-main-DniIUzDJ.svg"
            alt="Logo"
            className="h-12"
          />
        </div>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="block p-2 hover:bg-gray-700 rounded"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
  
        <ul>
          {isAuthenticated && (
            <a
              className="block p-2 hover:bg-gray-700 rounded"
              href="#"
              title="Convolution Main Repository"
              rel="noopener"
              onClick={logout}
            >
              Logout
            </a>
          )}
        </ul>
      </aside>
    )
  }

export default Sidebar;