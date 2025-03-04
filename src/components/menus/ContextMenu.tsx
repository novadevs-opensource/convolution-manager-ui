import React, { useEffect, useRef, useState } from 'react';

interface MenuOption {
  label: string;
  href: string;
  isExternal: boolean;
  handler?: () => void;
}

interface ContextMenuProps {
  button: React.ReactNode; // El botón que se va a pasar como hijo
  options: MenuOption[];   // Las opciones del menú
}

const ContextMenu: React.FC<ContextMenuProps> = ({ button, options }) => {
  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref para el menú
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref para el botón

  // Manejar el clic dentro/fuera del menú
  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current && 
      !menuRef.current.contains(event.target as Node) && 
      buttonRef.current && 
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpened(false);
    }
  };

  useEffect(() => {
    // Agregar el listener al document
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left w-full">
      <span
        ref={buttonRef}
        onClick={() => setIsMenuOpened(prev => !prev)}
        aria-expanded={isMenuOpened}
        aria-haspopup="true"
        className='flex cursor-pointer w-full block'
      >
        {button}
      </span>
      
      <div
        ref={menuRef}
        className={`absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition ease-out duration-100 transform ${
          isMenuOpened ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        role="menu" 
        aria-orientation="vertical" 
        tabIndex={-1}
      >
        {options.map((option, index) => (
          <div key={index} className="py-1" role="none">
            <a
              href={option.href}
              target={option.isExternal ? '_blank' : '_self'}
              rel={option.isExternal ? 'noopener noreferrer' : ''}
              className="block px-4 py-2 text-gray-700"
              role="menuitem"
              tabIndex={-1}
              onClick={option.handler}
            >
              {option.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;
