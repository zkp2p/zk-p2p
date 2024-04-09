import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';

import { AutoColumn } from '@components/layouts/Column';
import { NewPosition as VenmoNewPosition } from '@components/Deposit/venmo/NewPosition';
import { NewPosition as HdfcNewPosition } from '@components/Deposit/hdfc/NewPosition';
import { NewPosition as GarantiNewPosition } from '@components/Deposit/garanti/NewPosition';
import { NewPosition as WiseNewPosition } from '@components/Deposit/wise/NewPosition';
import { PositionTable } from '@components/Deposit/DepositTable';
import { OffRamperIntentTable } from '@components/Deposit/OffRamperIntentTable';
import { DepositIntent } from '@helpers/types';
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants';
import { colors } from '@theme/colors';
import useDeposits from '@hooks/venmo/useDeposits';
import useHdfcDeposits from '@hooks/hdfc/useDeposits';
import useGarantiDeposits from '@hooks/garanti/useDeposits';
import useWiseDeposits from '@hooks/wise/useDeposits';
import usePlatformSettings from '@hooks/usePlatformSettings';


export default function Deposit() {
  /*
   * Contexts
   */

  const {
    refetchDeposits: refetchVenmoDeposits,
    shouldFetchDeposits: shouldFetchVenmoDeposits,
    depositIntents: venmoDepositIntents,
    shouldFetchDepositIntents: shouldFetchVenmoDepositIntents,
    refetchDepositIntents: refetchVenmoDepositIntents,
  } = useDeposits();

  const {
    refetchDeposits: refetchHdfcDeposits,
    shouldFetchDeposits: shouldFetchHdfcDeposits,
    depositIntents: hdfcDepositIntents,
    shouldFetchDepositIntents: shouldFetchHdfcDepositIntents,
    refetchDepositIntents: refetchHdfcDepositIntents,
  } = useHdfcDeposits();

  const {
    refetchDeposits: refetchGarantiDeposits,
    shouldFetchDeposits: shouldFetchGarantiDeposits,
    depositIntents: garantiDepositIntents,
    shouldFetchDepositIntents: shouldFetchGarantiDepositIntents,
    refetchDepositIntents: refetchGarantiDepositIntents,
  } = useGarantiDeposits();

  const {
    refetchDeposits: refetchWiseDeposits,
    shouldFetchDeposits: shouldFetchWiseDeposits,
    depositIntents: wiseDepositIntents,
    shouldFetchDepositIntents: shouldFetchWiseDepositIntents,
    refetchDepositIntents: refetchWiseDepositIntents,
  } = useWiseDeposits();

  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  /*
   * State
   */

  const [isAddPosition, setIsAddPosition] = useState<boolean>(false);

  const [depositIntents, setDepositIntents] = useState<DepositIntent[]>([]);

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchVenmoDeposits) {
      const intervalId = setInterval(() => {
        refetchVenmoDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchVenmoDeposits]);

  useEffect(() => {
    if (shouldFetchHdfcDeposits) {
      const intervalId = setInterval(() => {
        refetchHdfcDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchHdfcDeposits]);

  useEffect(() => {
    if (shouldFetchGarantiDeposits) {
      const intervalId = setInterval(() => {
        refetchGarantiDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchGarantiDeposits]);

  useEffect(() => {
    if (shouldFetchWiseDeposits) {
      const intervalId = setInterval(() => {
        refetchWiseDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchWiseDeposits]);

  useEffect(() => {
    if (shouldFetchVenmoDepositIntents) {
      const intervalId = setInterval(() => {
        refetchVenmoDepositIntents?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchVenmoDepositIntents]);

  useEffect(() => {
    if (shouldFetchHdfcDepositIntents) {
      const intervalId = setInterval(() => {
        refetchHdfcDepositIntents?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchHdfcDepositIntents]);

  useEffect(() => {
    if (shouldFetchGarantiDepositIntents) {
      const intervalId = setInterval(() => {
        refetchGarantiDepositIntents?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchGarantiDepositIntents]);

  useEffect(() => {
    if (shouldFetchWiseDepositIntents) {
      const intervalId = setInterval(() => {
        refetchWiseDepositIntents?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchWiseDepositIntents]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        if (venmoDepositIntents) {
          setDepositIntents(venmoDepositIntents);
        }
        break;

      case PaymentPlatform.HDFC:
        if (hdfcDepositIntents) {
          setDepositIntents(hdfcDepositIntents);
        }
        break;

      case PaymentPlatform.GARANTI:
        if (garantiDepositIntents) {
          setDepositIntents(garantiDepositIntents);
        }
        break;

      case PaymentPlatform.WISE:
        if (wiseDepositIntents) {
          setDepositIntents(wiseDepositIntents);
        }
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      venmoDepositIntents,
      hdfcDepositIntents,
      garantiDepositIntents,
      wiseDepositIntents
    ]
  );

  /*
   * Handlers
   */

  const handleUpdateClick = () => {
    setIsAddPosition(true);
  }

  const handleBackClickOnNewDeposit = () => {
    setIsAddPosition(false);
  }

  /*
   * Component
   */

  function renderContent() {
    if (isAddPosition) {
      switch (paymentPlatform) {
        case PaymentPlatform.VENMO:
          return (
            <VenmoNewPosition
              handleBackClick={handleBackClickOnNewDeposit}
            />
          );

        case PaymentPlatform.HDFC:
          return (
            <HdfcNewPosition
              handleBackClick={handleBackClickOnNewDeposit}
            />
          );

        case PaymentPlatform.GARANTI:
          return (
            <GarantiNewPosition
              handleBackClick={handleBackClickOnNewDeposit}
            />
          );

        case PaymentPlatform.WISE:
          return (
            <WiseNewPosition
              handleBackClick={handleBackClickOnNewDeposit}
            />
          );
      }
    }
  
    return (
      <DepositAndIntentContainer>
        <PositionTable
          handleNewPositionClick={handleUpdateClick}
        />

        {depositIntents.length > 0 ? (
          <>
            <VerticalDivider />
            <OffRamperIntentTable/>
          </>
        ) : null}
      </DepositAndIntentContainer>
    );
  }

  return (
    <Wrapper>
      <Content>
        {renderContent()}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(AutoColumn)`
  max-width: 660px;
  width: 100%;
`

const DepositAndIntentContainer = styled.div`
  display: grid;
  border-radius: 16px;
`;

const Content = styled.main`
  gap: 1rem;
`;

const VerticalDivider = styled.div`
  height: 24px;
  border-left: 1px solid ${colors.defaultBorderColor};
  margin: 0 auto;
`;
