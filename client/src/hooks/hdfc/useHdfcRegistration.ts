import { useContext } from 'react';

import { RegistrationContext } from '../../contexts/hdfc/Registration';

const useRegistration = () => {
  return { ...useContext(RegistrationContext) }
};

export default useRegistration;
