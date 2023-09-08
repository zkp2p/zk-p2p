import { createContext } from 'react'

import { Intent } from '../Deposits/types'


interface OnRamperIntentsValues {
  currentIntentHash: string;
  currentIntent: Intent;
}

const defaultValues: OnRamperIntentsValues = {
  currentIntentHash: '',
  currentIntent: {
    onRamper: '',
    deposit: '',
    amount: 0,
    timestamp: 0,
  },
};

const OnRamperIntentsContext = createContext<OnRamperIntentsValues>(defaultValues)

export default OnRamperIntentsContext
