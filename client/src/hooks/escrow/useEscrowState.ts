import { useContext } from 'react';

import { EscrowContext } from '../../contexts/escrow/Escrow';

const useEscrowState = () => {
  return { ...useContext(EscrowContext) }
}

export default useEscrowState;
