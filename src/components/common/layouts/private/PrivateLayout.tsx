// src/components/layouts/PrivateLayout.tsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import UserBlock from './userBlock/UserBlock'
import { GrGroup, GrHomeRounded } from "react-icons/gr";
import { GrUserAdd } from "react-icons/gr";
import { GrSettingsOption } from "react-icons/gr";
import { GrMenu } from "react-icons/gr";

type LayoutProps = {
  pageTitle: string,
  children: React.ReactNode
}

const PrivateLayout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  const [sidebarIsVisible, setSidebarIsVisible] = useState<boolean>(false)
  
  const menuItems = [
    { name: 'Home', path: '/dashboard', icon: <GrHomeRounded />},
    { name: 'Profile', path: '/profile', icon: <GrSettingsOption />},
    { name: 'Create agent', path: '/agent/character', icon: <GrUserAdd/>},
    { name: 'Your agents', path: '/agent/list', icon: <GrGroup/>},
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
    <div className="m-0 font-sans bg-yellow-50 h-screen flex relative z-2">
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
      
      <main className="sm:px-8 py-[3vh] px-4 w-full max-h-[100vh] overflow-y-scroll">
        {/* header */}
        <div className='flex flex-row justify-between gap-4'>
          <Header title={pageTitle} />
          <UserBlock className={'hidden sm:block'} hasBorder={false} hasMenu={true}/>
          {!sidebarIsVisible &&
            <button 
              className='sm:hidden block text-black rounded-lg p-2 mb-4' 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              {sidebarIsVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <GrMenu className='text-4xl' />
              )}
            </button>
          }
        </div>
        {/* body */}
        {children}
      </main>
      <div className='absolute left-8 bottom-0'>
        <span className='text-gray-400 text-xs'>{__APP_VERSION__}</span>
      </div>
    </div>
  )
}

export default PrivateLayout