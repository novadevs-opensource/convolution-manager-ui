// src/components/layouts/PrivateLayout.tsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import UserBlock from './userBlock/UserBlock'
import { GrHomeRounded } from "react-icons/gr";
import { GrUserAdd } from "react-icons/gr";
import { GrSettingsOption } from "react-icons/gr";

type LayoutProps = {
  pageTitle: string,
  children: React.ReactNode
}

const PrivateLayout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  const [sidebarIsVisible, setSidebarIsVisible] = useState<boolean>(false)
  
  const menuItems = [
    { name: 'Home', path: '/dashboard', icon: <GrHomeRounded />},
    { name: 'Profile', path: '/profile', icon: <GrSettingsOption />},
    { name: 'Create icon', path: '/agent/character', icon: <GrUserAdd/>},
  ]

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarIsVisible(!sidebarIsVisible)
  }

  // Close sidebar explicitly
  const closeSidebar = () => {
    setSidebarIsVisible(false)
  }

  return (
    <div className="m-0 font-sans bg-gray-50 flex relative z-2">
      {/* Overlay para cerrar el sidebar cuando se hace click fuera (solo en móvil) */}
      {sidebarIsVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <Sidebar 
        show={sidebarIsVisible} 
        menuItems={menuItems} 
        onClose={closeSidebar} 
      />
      
      <main className="sm:p-8 p-4 w-full max-h-[100vh] overflow-y-scroll">
        <div className='flex flex-row justify-between gap-4'>
          <Header title={pageTitle} />
          <UserBlock className={'hidden sm:block'} hasBorder={false} hasMenu={true}/>
          <button 
            className='sm:hidden block bg-white rounded-lg border p-4 mb-4' 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
        {/*<div className="sm:p-4 p-1 sm:bg-white sm:rounded-lg sm:border">*/}
        <div className="rounded">
          {children}
        </div>
      </main>
    </div>
  )
}

export default PrivateLayout