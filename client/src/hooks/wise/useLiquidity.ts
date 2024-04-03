import { useContext } from 'react';

import { LiquidityContext } from '../../contexts/wise/Liquidity';

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
};

export default useLiquidity;
