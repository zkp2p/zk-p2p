import { createContext } from 'react';

import { IndicativeQuote } from '@helpers/types';


interface SwapQuoteValues {
  isRegistered: boolean;
  registrationHash: string | null;
  refetchDeposits: (() => void) | null;
  getBestDepositForAmount: ((requestedOnRampInputAmount: string, onRamperRegistrationHash: string) => IndicativeQuote) | null;
  shouldFetchDeposits: boolean;
  refetchDepositCounter: (() => void) | null;
  shouldFetchRampState: boolean;
  onRampCooldownPeriod: bigint | null;
  currentIntentHash: string | null;
  refetchIntentHash: (() => void) | null;
  shouldFetchIntentHash: boolean;
  lastOnRampTimestamp: bigint | null;
  refetchLastOnRampTimestamp: (() => void) | null;
};

const defaultValues: SwapQuoteValues = {
  isRegistered: false,
  registrationHash: null,
  refetchDeposits: null,
  getBestDepositForAmount: null,
  shouldFetchDeposits: false,
  refetchDepositCounter: null,
  shouldFetchRampState: false,
  onRampCooldownPeriod: null,
  currentIntentHash: null,
  refetchIntentHash: null,
  shouldFetchIntentHash: false,
  lastOnRampTimestamp: null,
  refetchLastOnRampTimestamp: null,
};

const SwapQuoteContext = createContext<SwapQuoteValues>(defaultValues);

export default SwapQuoteContext;
