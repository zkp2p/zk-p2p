import React, { useCallback, useEffect, useState, ReactNode } from 'react'
import { isMobile } from 'react-device-detect';

import usePlatformSettings from '@hooks/usePlatformSettings';
import { MODALS } from '@helpers/types';

import ModalSettingsContext from './ModalSettingsContext'


interface ProvidersProps {
  children: ReactNode;
}

const ModalSettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * Context
   */

  const {
    PaymentPlatform,
    paymentPlatform
  } = usePlatformSettings();

  /*
   * State
   */

  const [currentModal, setCurrentModal] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    if (isMobile && paymentPlatform === PaymentPlatform.REVOLUT) {
      setCurrentModal(MODALS.NOT_SUPPORTED_PLATFORM_DEVICE);
    } else {
      setCurrentModal(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, paymentPlatform]);
  
  /*
   * Handlers
   */

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
