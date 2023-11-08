import { createContext } from 'react'

import { OnRamperIntent } from '../Deposits/types'


interface OnRamperIntentsValues {
  currentIntent: OnRamperIntent | null;
  currentIntentHash: string | null;
  refetchIntentHash: (() => void) | null;
  lastOnRampTimestamp: bigint | null;
  refetchLastOnRampTimestamp: (() => void) | null;
  shouldFetchIntentHash: boolean;
}

const defaultValues: OnRamperIntentsValues = {
  currentIntent: null,
  currentIntentHash: null,
  refetchIntentHash: null,
  lastOnRampTimestamp: null,
  refetchLastOnRampTimestamp: null,
  shouldFetchIntentHash: false
};

const OnRamperIntentsContext = createContext<OnRamperIntentsValues>(defaultValues)

export default OnRamperIntentsContext
