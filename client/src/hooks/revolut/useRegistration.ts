import { useContext } from 'react';

import { RegistrationContext } from '../../contexts/revolut/Registration';

const useRegistration = () => {
  return { ...useContext(RegistrationContext) }
};

export default useRegistration;
