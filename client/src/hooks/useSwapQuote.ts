import { useContext } from 'react';

import { SwapQuoteContext } from '../contexts/common/SwapQuote';

const useSmartContracts = () => {
  return { ...useContext(SwapQuoteContext) }
};

export default useSmartContracts;
