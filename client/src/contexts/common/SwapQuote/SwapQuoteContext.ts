import { createContext } from 'react';

import { IndicativeQuote } from '../../venmo/Deposits/types';


interface SwapQuoteValues {
  isRegistered: boolean;
  // refetchDeposits: (() => void) | null;
  // getBestDepositForAmount: ((requestedOnRampInputAmount: string) => IndicativeQuote) | null;
  shouldFetchDeposits: boolean;
  // refetchDepositCounter: (() => void) | null;
  shouldFetchRampState: boolean;
  onRampCooldownPeriod: bigint | null;
  currentIntentHash: string | null;
  // refetchIntentHash: (() => void) | null;
  shouldFetchIntentHash: boolean;
  lastOnRampTimestamp: bigint | null;
  // refetchLastOnRampTimestamp: (() => void) | null;
};

const defaultValues: SwapQuoteValues = {
  isRegistered: false,
  // refetchDeposits: null,
  // getBestDepositForAmount: null,
  shouldFetchDeposits: false,
  // refetchDepositCounter: null,
  shouldFetchRampState: false,
  onRampCooldownPeriod: null,
  currentIntentHash: null,
  // refetchIntentHash: null,
  shouldFetchIntentHash: false,
  lastOnRampTimestamp: null,
  // refetchLastOnRampTimestamp: null,
};

const AccountContext = createContext<SwapQuoteValues>(defaultValues);

export default AccountContext;
