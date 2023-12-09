import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { AutoColumn } from '../layouts/Column'
import { NewPosition as VenmoNewPosition } from './NewPosition'
import { NewPosition as HdfcNewPosition } from './hdfc/NewPosition'
import { PositionTable } from './PositionTable'
import { OffRamperIntentTable } from './OffRamperIntentTable'
import { DepositIntent } from "../../contexts/venmo/Deposits/types";
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants'
import useDeposits from '@hooks/useDeposits';
import useHdfcDeposits from '@hooks/hdfc/useHdfcDeposits';
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

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoDepositIntents, hdfcDepositIntents]);

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
            <NewPositionContainer>
              <VenmoNewPosition
                handleBackClick={handleBackClickOnNewDeposit}
              />
            </NewPositionContainer>
          );

        case PaymentPlatform.HDFC:
          return (
            <NewPositionContainer>
              <HdfcNewPosition
                handleBackClick={handleBackClickOnNewDeposit}
              />
            </NewPositionContainer>
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
  padding-top: 1.5rem;
`

const DepositAndIntentContainer = styled.div`
  display: grid;
  border-radius: 16px;
`;

const Content = styled.main`
  gap: 1rem;
`;

const NewPositionContainer = styled.div`
  display: grid;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const VerticalDivider = styled.div`
  height: 24px;
  border-left: 1px solid #98a1c03d;
  margin: 0 auto;
`;
