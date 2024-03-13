import { useContext } from 'react';

import { RegistrationContext } from '../../contexts/wise/Registration';

const useRegistration = () => {
  return { ...useContext(RegistrationContext) }
};

export default useRegistration;
