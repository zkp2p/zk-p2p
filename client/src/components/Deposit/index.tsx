import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { AutoColumn } from '../layouts/Column'
import { NewPosition as VenmoNewPosition } from './NewPosition'
import { NewPosition as HdfcNewPosition } from './hdfc/NewPosition'
import { PositionTable } from './PositionTable'
import { OffRamperIntentTable } from './OffRamperIntentTable'
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants'
import useDeposits from '@hooks/useDeposits';
import usePlatformSettings from '@hooks/usePlatformSettings';


export default function Deposit() {
  /*
   * Contexts
   */

  const { depositIntents, refetchDeposits, shouldFetchDeposits } = useDeposits();
  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  /*
   * State
   */

  const [isAddPosition, setIsAddPosition] = useState<boolean>(false);

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchDeposits) {
      const intervalId = setInterval(() => {
        refetchDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);
  
      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchDeposits]);

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

        {depositIntents && depositIntents.length > 0 ? (
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
  gap: 1rem;
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
