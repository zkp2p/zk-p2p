import { useContext } from 'react'

import { LiquidityContext } from '../contexts/common/Liquidity'

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
}

export default useLiquidity
