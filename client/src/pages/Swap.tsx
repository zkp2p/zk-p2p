import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import SwapForm from "@components/Swap";
import { OnRamp as VenmoOnRamp } from '@components/Swap/venmo/OnRamp';
import { OnRamp as HdfcOnRamp } from '@components/Swap/hdfc/OnRamp';
import { OnRamp as GarantiOnRamp } from '@components/Swap/garanti/OnRamp';
import { OnRamp as WiseOnRamp } from '@components/Swap/revolut/OnRamp';
import useHdfcOnRamperIntents from '@hooks/hdfc/useOnRamperIntents';
import useHdfcRampState from '@hooks/hdfc/useRampState';
import usePlatformSettings from '@hooks/usePlatformSettings';
import useBalances from '@hooks/useBalance';
import useOnRamperIntents from '@hooks/venmo/useOnRamperIntents';
import useRampState from '@hooks/venmo/useRampState';
import useGarantiOnRamperIntents from '@hooks/garanti/useOnRamperIntents';
import useGarantiRampState from '@hooks/garanti/useRampState';
import useRevolutOnRamperIntents from '@hooks/revolut/useOnRamperIntents';
import useRevolutRampState from '@hooks/revolut/useRampState';



export const Swap: React.FC = () => {
  /*
   * Contexts
   */

  const { refetchUsdcBalance, shouldFetchUsdcBalance } = useBalances();
  
  const {
    currentIntentHash: currentVenmoIntentHash,
    refetchIntentHash: refetchVenmoIntentHash,
    shouldFetchIntentHash: shouldFetchVenmoIntentHash,
    refetchLastOnRampTimestamp: refetchLastVenmoOnRampTimestamp
  } = useOnRamperIntents();

  const {
    refetchDepositCounter: refetchVenmoDepositCounter,
    shouldFetchRampState: shouldFetchVenmoRampState,
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
    currentIntentHash: currentGarantiIntentHash,
    refetchIntentHash: refetchGarantiIntentHash,
    shouldFetchIntentHash: shouldFetchGarantiIntentHash,
    refetchLastOnRampTimestamp: refetchLastGarantiOnRampTimestamp
  } = useGarantiOnRamperIntents();

  const {
    refetchDepositCounter: refetchGarantiDepositCounter,
    shouldFetchRampState: shouldFetchGarantiRampState,
  } = useGarantiRampState();

  const {
    currentIntentHashAsUint: currentWiseIntentHashAsUint,
    refetchIntentHash: refetchRevolutIntentHash,
    shouldFetchIntentHash: shouldFetchWiseIntentHash,
    refetchLastOnRampTimestamp: refetchLastWiseOnRampTimestamp
  } = useRevolutOnRamperIntents();

  const {
    refetchDepositCounter: refetchRevolutDepositCounter,
    shouldFetchRampState: shouldFetchWiseRampState,
  } = useRevolutRampState();

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
    if (shouldFetchUsdcBalance) {
      refetchUsdcBalance?.();
    }

    if (shouldFetchVenmoIntentHash) {
      refetchVenmoIntentHash?.();
      refetchLastVenmoOnRampTimestamp?.();
    }

    if (shouldFetchVenmoRampState) {
      refetchVenmoDepositCounter?.();
    }

    if (shouldFetchHdfcIntentHash) {
      refetchHdfcIntentHash?.();
      refetchLastHdfcOnRampTimestamp?.();
    }

    if (shouldFetchHdfcRampState) {
      refetchHdfcDepositCounter?.();
    }

    if (shouldFetchGarantiIntentHash) {
      refetchGarantiIntentHash?.();
      refetchLastGarantiOnRampTimestamp?.();
    }

    if (shouldFetchGarantiRampState) {
      refetchGarantiDepositCounter?.();
    }

    if (shouldFetchWiseIntentHash) {
      refetchRevolutIntentHash?.();
      refetchLastWiseOnRampTimestamp?.();
    }

    if (shouldFetchWiseRampState) {
      refetchRevolutDepositCounter?.();
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
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setSelectedIntentHash(currentVenmoIntentHash);
        break;
      
      case PaymentPlatform.HDFC:
        setSelectedIntentHash(currentHdfcIntentHash);
        break;

      case PaymentPlatform.GARANTI:
        setSelectedIntentHash(currentGarantiIntentHash);
        break;

      case PaymentPlatform.REVOLUT:
        setSelectedIntentHash(currentWiseIntentHashAsUint);
        break;
    }
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
            selectedIntentHash={selectedIntentHash as any}
          />
        );

      case PaymentPlatform.HDFC:
        return (
          <HdfcOnRamp
            handleBackClick={handleBackClick}
            selectedIntentHash={selectedIntentHash as any}
          />
        );

      case PaymentPlatform.GARANTI:
        return (
          <GarantiOnRamp
            handleBackClick={handleBackClick}
            selectedIntentHash={selectedIntentHash as any}
          />
        );

      case PaymentPlatform.REVOLUT:
        return (
          <WiseOnRamp
            handleBackClick={handleBackClick}
            selectedUIntIntentHash={currentWiseIntentHashAsUint as any}
          />
        );

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
  };

  return (
    <PageWrapper>
      {!selectedIntentHash ? (
        <SwapForm
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
