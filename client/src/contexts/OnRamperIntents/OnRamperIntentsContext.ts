import { createContext } from 'react'

import { OnRamperIntent } from '../Deposits/types'


interface OnRamperIntentsValues {
  currentIntentHash: string | null;
  currentIntent: OnRamperIntent | null;
  refetchIntentHash: (() => void) | null;
  shouldFetchIntentHash: boolean;
}

const defaultValues: OnRamperIntentsValues = {
  currentIntentHash: null,
  currentIntent: null,
  refetchIntentHash: null,
  shouldFetchIntentHash: false
};

const OnRamperIntentsContext = createContext<OnRamperIntentsValues>(defaultValues)

export default OnRamperIntentsContext
