// src/components/common/Modal.tsx
import React, { ReactNode, useState, forwardRef, useImperativeHandle, ForwardedRef, useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animation?: 'fade' | 'slide' | 'none';
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  animationDuration?: number;
}

export interface ModalHandles {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const Modal = forwardRef((props: ModalProps, ref: ForwardedRef<ModalHandles>) => {
  const { 
    title, 
    children, 
    footer,
    maxWidth = '2xl',
    animation = 'fade',
    onClose,
    closeOnOverlayClick = true,
    animationDuration = 300,
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle modal opening
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Function to close the modal
  const handleClose = () => {
    if (isClosing) return; // Prevent double closing
    
    setIsClosing(true);
    if (onClose) onClose();
    
    // Wait for animation to finish before hiding
    if (animation !== 'none') {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setIsVisible(false);
        setIsClosing(false);
        closeTimeoutRef.current = null;
      }, animationDuration);
    } else {
      // No animation, close immediately
      setIsOpen(false);
      setIsVisible(false);
      setIsClosing(false);
    }
  };

  // Clean up timeout if component unmounts
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Expose methods to control the modal
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    },
    close: handleClose,
    isOpen
  }));

  // Handler for overlay click
  const handleOverlayClick = (_e: React.MouseEvent) => {
    if (closeOnOverlayClick && !isClosing) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  };

  // Determine animation class based on state
  const getAnimationClass = () => {
    if (animation === 'none') return '';
    
    if (isClosing) {
      return animation === 'fade' ? 'animate-fadeout' : 'animate-slideout';
    } else {
      return animation === 'fade' ? 'animate-fadein' : 'animate-slidein';
    }
  };

  // Determine animation class for overlay (always fade)
  const getOverlayAnimationClass = () => {
    if (isClosing) {
      return 'animate-fadeout';
    } else {
      return 'animate-fadein';
    }
  };

  return (
    <>
      {/* Overlay background with independent animation */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-40 ${getOverlayAnimationClass()}`}
        onClick={handleOverlayClick}
        style={{ animationDuration: `${animationDuration}ms` }}
      ></div>
      
      {/* Modal container with flexbox centering */}
      <div 
        tabIndex={-1} 
        aria-hidden="true" 
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-full`}>
          {/* Modal content */}
          <div 
            className={`relative bg-white rounded-lg shadow-lg ${getAnimationClass()}`}
            onClick={(e) => e.stopPropagation()}
            style={{ animationDuration: `${animationDuration}ms` }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button 
                onClick={handleClose} 
                type="button" 
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                disabled={isClosing}
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            
            {/* Modal body */}
            <div className="p-4 md:p-5 space-y-4 overflow-y-auto">
              {children}
            </div>
            
            {/* Modal footer - conditionally rendered */}
            {footer && (
              <div className="flex items-center gap-2 justify-end p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

Modal.displayName = 'Modal';

export default Modal;