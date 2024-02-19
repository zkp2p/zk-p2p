import { useContext } from 'react';

import { LiquidityContext } from '../../contexts/garanti/Liquidity';

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
};

export default useLiquidity;
