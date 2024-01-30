import { createContext } from 'react';


interface ModalSettingsValues {
  currentModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
};

const ModalSettingsContext = createContext<ModalSettingsValues>({
  currentModal: null as string | null,
  openModal: (modalId: string) => {},
  closeModal: () => {},
});

export default ModalSettingsContext;
