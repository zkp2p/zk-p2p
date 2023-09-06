import { createContext } from 'react'

import { ContextValues } from './types'


const BalancesContext = createContext<ContextValues>({})

export default BalancesContext
