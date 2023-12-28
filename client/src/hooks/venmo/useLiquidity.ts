import { useContext } from 'react'

import { LiquidityContext } from '../../contexts/venmo/Liquidity'

const useLiquidity = () => {
  return { ...useContext(LiquidityContext) }
}

export default useLiquidity
