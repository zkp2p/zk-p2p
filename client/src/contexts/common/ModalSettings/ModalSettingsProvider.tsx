import React, { useCallback, useState, ReactNode } from 'react'

import ModalSettingsContext from './ModalSettingsContext'


interface ProvidersProps {
  children: ReactNode;
}

const ModalSettingsProvider = ({ children }: ProvidersProps) => {
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  const openModal = useCallback((modalId: string) => {
    setCurrentModal(modalId);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentModal(null);
  }, []);

  return (
    <ModalSettingsContext.Provider
      value={{
        currentModal,
        openModal,
        closeModal
      }}
    >
      {children}
    </ModalSettingsContext.Provider>
  );
};

export default ModalSettingsProvider;
