// src/components/layouts/PrivateLayout.tsx
import React from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Breadcrumbs from './Breadcrumbs'


type LayoutProps = {
  pageTitle: string,
  children: React.ReactNode
}

const PrivateLayout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  const { pathname } = useLocation()
  const menuItems = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Create Character', path: '/agent/character' },
  ]

  const getBreadcrumbs = () => {
    // Aquí calculamos las migas de pan según la ruta actual
    const pathArray = pathname.split('/').filter(Boolean)
    return pathArray.map((part) => (
      part.charAt(0).toUpperCase() + part.slice(1)
    ))
  }

  return (
    <div className="m-0 font-sans bg-gray-50 flex">
      <Sidebar menuItems={menuItems} />
      <main className="p-4 w-full overflow-hidden">
        {/* <Breadcrumbs items={getBreadcrumbs()} /> */}
        <Header title={pageTitle} />
        <div className="p-4 bg-white rounded-lg border">
          {children}
        </div>
      </main>
    </div>
  )
}

export default PrivateLayout
