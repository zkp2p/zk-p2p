import { useContext } from 'react';

import { LiquidityContext } from '../../contexts/escrow/Liquidity';

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
};

export default useLiquidity;
