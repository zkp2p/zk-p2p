import { useContext } from 'react';

import { ModalSettingsContext } from '../contexts/common/ModalSettings';


const useModal = () => {
  return { ...useContext(ModalSettingsContext) };
};

export default useModal;
