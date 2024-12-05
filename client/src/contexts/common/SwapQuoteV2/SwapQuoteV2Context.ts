import { createContext } from 'react';

import { IndicativeQuoteV2 } from '@helpers/types';

interface SwapQuoteV2Values {
  refetchDeposits: (() => void) | null;
  getBestDepositForAmount: ((requestedOnRampInputAmount: string, onRamperRegistrationHash: string) => IndicativeQuoteV2) | null;
  shouldFetchDeposits: boolean;
  refetchDepositCounter: (() => void) | null;
  shouldFetchRampState: boolean;
  currentIntentHash: string | null;
  refetchIntentHash: (() => void) | null;
  refetchIntentHashAsUint: (() => void) | null;
  shouldFetchIntentHash: boolean;
};

const defaultValues: SwapQuoteV2Values = {
  refetchDeposits: null,
  getBestDepositForAmount: null,
  shouldFetchDeposits: false,
  refetchDepositCounter: null,
  refetchIntentHashAsUint: null,
  shouldFetchRampState: false,
  currentIntentHash: null,
  refetchIntentHash: null,
  shouldFetchIntentHash: false,
};

const SwapQuoteV2Context = createContext<SwapQuoteV2Values>(defaultValues);

export default SwapQuoteV2Context;
