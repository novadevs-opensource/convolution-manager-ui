// src/hooks/useModal.ts
import { useRef, useCallback } from 'react';
import { ModalHandles } from '../components/common/Modal';

/**
 * Custom hook for easy modal management
 * @returns Object with methods and properties to control the modal
 */
export const useModal = () => {
  const modalRef = useRef<ModalHandles>(null);
  
  const open = useCallback(() => {
    modalRef.current?.open();
  }, []);
  
  const close = useCallback(() => {
    modalRef.current?.close();
  }, []);
  
  const isOpen = useCallback(() => {
    return modalRef.current?.isOpen || false;
  }, []);
  
  return {
    modalRef,
    open,
    close,
    isOpen
  };
};

export default useModal;