import { useContext } from 'react';

import { SwapQuoteV2Context } from '../contexts/common/SwapQuoteV2';

const useSwapQuoteV2 = () => {
  return { ...useContext(SwapQuoteV2Context) }
};

export default useSwapQuoteV2;
