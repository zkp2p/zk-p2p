import { createContext } from 'react'

import { OnRamperIntent } from '../Deposits/types'


interface OnRamperIntentsValues {
  currentIntentHash: string | null;
  currentIntent: OnRamperIntent | null;
  refetchIntentHash: (() => void) | null;
}

const defaultValues: OnRamperIntentsValues = {
  currentIntentHash: null,
  currentIntent: null,
  refetchIntentHash: null
};

const OnRamperIntentsContext = createContext<OnRamperIntentsValues>(defaultValues)

export default OnRamperIntentsContext
