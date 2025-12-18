'use client';

import React, { createContext, useContext, useState } from 'react';

interface AddServiceModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AddServiceModalContext = createContext<AddServiceModalContextType | undefined>(undefined);

export function AddServiceModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <AddServiceModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AddServiceModalContext.Provider>
  );
}

export function useAddServiceModal() {
  const context = useContext(AddServiceModalContext);
  if (context === undefined) {
    throw new Error('useAddServiceModal must be used within an AddServiceModalProvider');
  }
  return context;
}


