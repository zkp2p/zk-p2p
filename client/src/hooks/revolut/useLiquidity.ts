import { useContext } from 'react';

import { LiquidityContext } from '../../contexts/revolut/Liquidity';

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
};

export default useLiquidity;
