import { createContext } from 'react'

import { Intent } from '../Deposits/types'
import { ZERO } from '@helpers/constants'


interface OnRamperIntentsValues {
  currentIntentHash: string;
  currentIntent: Intent;
}

const defaultValues: OnRamperIntentsValues = {
  currentIntentHash: '',
  currentIntent: {
    onRamper: '',
    deposit: '',
    amount: ZERO,
    timestamp: ZERO,
    to: '',
  },
};

const OnRamperIntentsContext = createContext<OnRamperIntentsValues>(defaultValues)

export default OnRamperIntentsContext
