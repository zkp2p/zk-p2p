import { useContext } from 'react'

import { LiquidityContext } from '../contexts/Liquidity'

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
}

export default useLiquidity
