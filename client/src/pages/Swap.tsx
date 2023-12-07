import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import SwapModal from "@components/Swap";
import { OnRamp as VenmoOnRamp } from '@components/Swap/OnRamp';
import { OnRamp as HdfcOnRamp } from '@components/Swap/hdfc/OnRamp';

import useBalances from '@hooks/useBalance';
import useOnRamperIntents from '@hooks/useOnRamperIntents';
import useRampState from '@hooks/useRampState';

import useHdfcOnRamperIntents from '@hooks/hdfc/useHdfcOnRamperIntents';
import useHdfcRampState from '@hooks/hdfc/useHdfcRampState';
import usePlatformSettings from '@hooks/usePlatformSettings';


export const Swap: React.FC<{}> = (props) => {
  /*
   * Contexts
   */

  const { refetchUsdcBalance, shouldFetchUsdcBalance } = useBalances();
  const {
    currentIntentHash,
    refetchIntentHash,
    shouldFetchIntentHash,
    refetchLastOnRampTimestamp
  } = useOnRamperIntents();

  const {
    refetchDepositCounter,
    shouldFetchRampState
  } = useRampState();

  const {
    currentIntentHash: currentHdfcIntentHash,
    refetchIntentHash: refetchHdfcIntentHash,
    shouldFetchIntentHash: shouldFetchHdfcIntentHash,
    refetchLastOnRampTimestamp: refetchLastHdfcOnRampTimestamp
  } = useHdfcOnRamperIntents();

  const {
    refetchDepositCounter: refetchHdfcDepositCounter,
    shouldFetchRampState: shouldFetchHdfcRampState,
  } = useHdfcRampState();

  const {
    PaymentPlatform,
    paymentPlatform
  } = usePlatformSettings();

  /*
   * State
   */

  const [selectedIntentHash, setSelectedIntentHash] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchIntentHash) {
      refetchIntentHash?.();
      refetchLastOnRampTimestamp?.();
    }

    if (shouldFetchRampState) {
      refetchDepositCounter?.();
    }

    if (shouldFetchUsdcBalance) {
      refetchUsdcBalance?.();
    }

    console.log('shouldFetchHdfcIntentHash: ', shouldFetchHdfcIntentHash);

    if (shouldFetchHdfcIntentHash) {
      refetchHdfcIntentHash?.();
      refetchLastHdfcOnRampTimestamp?.();
    }

    console.log('shouldFetchHdfcRampState: ', shouldFetchHdfcRampState);

    if (shouldFetchHdfcRampState) {
      refetchHdfcDepositCounter?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Handlers
   */

  const handleBackClick = () => {
    setSelectedIntentHash(null);
  }

  const handleIntentClick = () => {
    // console.log('selectedVenmoIntentHash', currentIntentHash);

    console.log('selectedHdfcIntentHash', currentHdfcIntentHash);

    // setSelectedIntentHash(currentIntentHash);

    setSelectedIntentHash(currentHdfcIntentHash);
  };

  /*
   * Component
   */

  const onRampComponent = () => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return (
          <VenmoOnRamp
            handleBackClick={handleBackClick}
            selectedIntentHash={selectedIntentHash}
          />
        );

      case PaymentPlatform.HDFC:
        return (
          <HdfcOnRamp
            handleBackClick={handleBackClick}
            selectedIntentHash={selectedIntentHash}
          />
        );

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
  };

  return (
    <PageWrapper>
      {!selectedIntentHash ? (
        <SwapModal
          onIntentTableRowClick={handleIntentClick}
        />
      ) : (
        <OnRampContainer>
          {onRampComponent()}
        </OnRampContainer>
      )}
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;
  align-items: center;
  justify-content: center;
  padding-bottom: 3rem;
`;

const OnRampContainer = styled.div`
  max-width: 660px;
  padding-top: 1.5rem;
`;
