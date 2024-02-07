import { useContext } from 'react';

import { RegistrationContext } from '../../contexts/garanti/Registration';

const useRegistration = () => {
  return { ...useContext(RegistrationContext) }
};

export default useRegistration;
