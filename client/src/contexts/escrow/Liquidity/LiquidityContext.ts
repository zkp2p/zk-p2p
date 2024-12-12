import { createContext } from 'react';

import {
  DepositView,
  StoredDeposit
} from '@helpers/types/escrow';

interface LiquidityValues {
  deposits: DepositView[] | null;
  depositStore: StoredDeposit[] | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
}

const defaultValues: LiquidityValues = {
  deposits: null,
  depositStore: null,
  refetchDeposits: null,
  shouldFetchDeposits: false,
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues);

export default LiquidityContext;
