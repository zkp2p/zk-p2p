import { useContext } from 'react';

import { LiquidityContext } from '../../contexts/hdfc/Liquidity';

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
};

export default useLiquidity;
