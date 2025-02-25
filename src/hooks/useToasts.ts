// src/hooks/useToasts.ts
import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a NotificationProvider');
  }
  return context;
};