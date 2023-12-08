import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Deposit"
import useDeposits from '@hooks/useDeposits';
import useHdfcDeposits from '@hooks/hdfc/useHdfcDeposits';
import useBalances from '@hooks/useBalance';
import usePlatformSettings from '@hooks/usePlatformSettings';


export const Deposit: React.FC<{}> = (props) => {
  /*
   * Contexts
   */

  const {
    refetchDeposits: refetchVenmoDeposits,
    shouldFetchDeposits: shouldFetchVenmoDeposits,
    refetchDepositIntents: refetchVenmoDepositIntents,
    shouldFetchDepositIntents: shouldFetchVenmoDepositIntents,
  } = useDeposits();

  const { refetchUsdcBalance, shouldFetchUsdcBalance } = useBalances();

  const {
    refetchDeposits: refetchHdfcDeposits,
    shouldFetchDeposits: shouldFetchHdfcDeposits,
    refetchDepositIntents: refetchHdfcDepositIntents,
    shouldFetchDepositIntents: shouldFetchHdfcDepositIntents,
  } = useHdfcDeposits();

  const {
    PaymentPlatform,
    paymentPlatform
  } = usePlatformSettings();

  /*
   * Hooks
   */

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        if (shouldFetchVenmoDeposits) {
          refetchVenmoDeposits?.();
        }

        if (shouldFetchVenmoDepositIntents) {
          refetchVenmoDepositIntents?.();
        }
        break;

      case PaymentPlatform.HDFC:
        if (shouldFetchHdfcDeposits) {
          refetchHdfcDeposits?.();
        }

        if (shouldFetchHdfcDepositIntents) {
          refetchHdfcDepositIntents?.();
        }
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    if (shouldFetchUsdcBalance) {
      refetchUsdcBalance?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper>
      <Main>
        <DepositTable />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  padding-bottom: 3rem;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

