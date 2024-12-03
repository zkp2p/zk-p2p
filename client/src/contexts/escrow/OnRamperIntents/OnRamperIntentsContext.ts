import { createContext } from 'react';

import { OnRamperIntent } from '@helpers/types/escrow';


interface OnRamperIntentsValues {
  currentIntent: OnRamperIntent | null;
  currentIntentHash: string | null;
  refetchIntentHash: (() => void) | null;
  shouldFetchIntentHash: boolean;
};

const defaultValues: OnRamperIntentsValues = {
  currentIntent: null,
  currentIntentHash: null,
  refetchIntentHash: null,
  shouldFetchIntentHash: false
};

const OnRamperIntentsContext = createContext<OnRamperIntentsValues>(defaultValues);

export default OnRamperIntentsContext;
