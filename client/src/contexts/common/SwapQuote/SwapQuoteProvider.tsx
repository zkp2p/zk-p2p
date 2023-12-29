import React, { useEffect, useState, ReactNode } from 'react';

import { IndicativeQuote } from '@helpers/types';
import { esl } from '@helpers/constants';
import usePlatformSettings from '@hooks/usePlatformSettings';

// Venmo
import useLiquidity from '@hooks/venmo/useLiquidity';
import useOnRamperIntents from '@hooks/venmo/useOnRamperIntents';
import useRampState from "@hooks/venmo/useRampState";
import useVenmoRegistration from "@hooks/venmo/useRegistration";

// Hdfc
import useHdfcLiquidity from '@hooks/hdfc/useLiquidity';
import useHdfcOnRamperIntents from '@hooks/hdfc/useOnRamperIntents';
import useHdfcRampState from "@hooks/hdfc/useRampState";
import useHdfcRegistration from '@hooks/hdfc/useRegistration';

import SwapQuoteContext from './SwapQuoteContext';


interface ProvidersProps {
  children: ReactNode;
}

const SwapQuoteProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  // Venmo
  const {
    isRegistered: isRegisteredOnVenmo
  } = useVenmoRegistration();
  const {
    refetchDeposits: refetchVenmoDeposits,
    getBestDepositForAmount: getBestVenmoDepositForAmount,
    shouldFetchDeposits: shouldFetchVenmoDeposits
  } = useLiquidity();
  const {
    refetchDepositCounter: refetchVenmoDepositCounter,
    shouldFetchRampState: shouldFetchVenmoRampState,
    onRampCooldownPeriod: venmoOnRampCooldownPeriod
  } = useRampState();
  const {
    currentIntentHash: currentVenmoIntentHash,
    refetchIntentHash: refetchVenmoIntentHash,
    shouldFetchIntentHash: shouldFetchVenmoIntentHash,
    lastOnRampTimestamp: lastVenmoOnRampTimestamp,
    refetchLastOnRampTimestamp: refetchVenmoLastOnRampTimestamp
  } = useOnRamperIntents();

  // Hdfc
  const {
    isRegistered: isRegisteredOnHdfc
  } = useHdfcRegistration();
  const {
    refetchDeposits: refetchHdfcDeposits,
    getBestDepositForAmount: getBestHdfcDepositForAmount,
    shouldFetchDeposits: shouldFetchHdfcDeposits
  } = useHdfcLiquidity();
  const {
    refetchDepositCounter: refetchHdfcDepositCounter,
    shouldFetchRampState: shouldFetchHdfcRampState,
    onRampCooldownPeriod: hdfcOnRampCooldownPeriod
  } = useHdfcRampState();
  const {
    currentIntentHash: currentHdfcIntentHash,
    refetchIntentHash: refetchHdfcIntentHash,
    shouldFetchIntentHash: shouldFetchHdfcIntentHash,
    lastOnRampTimestamp: lastHdfcOnRampTimestamp,
    refetchLastOnRampTimestamp: refetchHdfcLastOnRampTimestamp
  } = useHdfcOnRamperIntents();

  /*
   * State
   */

  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const [refetchDeposits, setRefetchDeposits] = useState<(() => void) | null>(null);
  const [getBestDepositForAmount, setGetBestDepositForAmount] = useState<((requestedOnRampInputAmount: string) => IndicativeQuote) | null>(null);
  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  const [refetchDepositCounter, setRefetchDepositCounter] = useState<(() => void) | null>(null);
  const [shouldFetchRampState, setShouldFetchRampState] = useState<boolean>(false);
  const [onRampCooldownPeriod, setOnRampCooldownPeriod] = useState<bigint | null>(null);
  
  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [refetchIntentHash, setRefetchIntentHash] = useState<(() => void) | null>(null);
  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);
  const [lastOnRampTimestamp, setLastOnRampTimestamp] = useState<bigint | null>(null);
  const [refetchLastOnRampTimestamp, setRefetchLastOnRampTimestamp] = useState<(() => void) | null>(null);

  /*
   * Registration
   */

  useEffect(() => {
    esl && console.log('isRegisteredOnVenmo: ', isRegisteredOnVenmo);
    esl && console.log('isRegisteredOnHdfc: ', isRegisteredOnHdfc);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setIsRegistered(isRegisteredOnVenmo);
        break;

      case PaymentPlatform.HDFC:
        setIsRegistered(isRegisteredOnHdfc);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, isRegisteredOnVenmo, isRegisteredOnHdfc]);


  /*
   * Liquidity
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDeposits: ', refetchVenmoDeposits);
    esl && console.log('refetchHdfcDeposits: ', refetchHdfcDeposits);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchDeposits(() => refetchVenmoDeposits);
        break;

      case PaymentPlatform.HDFC:
        setRefetchDeposits(() => refetchHdfcDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoDeposits, refetchHdfcDeposits]);

  useEffect(() => {
    esl && console.log('getBestVenmoDepositForAmount: ', getBestVenmoDepositForAmount);
    esl && console.log('getBestHdfcDepositForAmount: ', getBestHdfcDepositForAmount);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setGetBestDepositForAmount(() => getBestVenmoDepositForAmount);
        break;

      case PaymentPlatform.HDFC:
        setGetBestDepositForAmount(() => getBestHdfcDepositForAmount);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, getBestVenmoDepositForAmount, getBestHdfcDepositForAmount]);

  useEffect(() => {
    esl && console.log('shouldFetchVenmoDeposits: ', shouldFetchVenmoDeposits);
    esl && console.log('shouldFetchHdfcDeposits: ', shouldFetchHdfcDeposits);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setShouldFetchDeposits(shouldFetchVenmoDeposits);
        break;

      case PaymentPlatform.HDFC:
        setShouldFetchDeposits(shouldFetchHdfcDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, shouldFetchVenmoDeposits, shouldFetchHdfcDeposits]);
  

  /*
   * On Ramper Intents
   */

  useEffect(() => {
    esl && console.log('currentVenmoIntentHash: ', currentVenmoIntentHash);
    esl && console.log('currentHdfcIntentHash: ', currentHdfcIntentHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setCurrentIntentHash(currentVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setCurrentIntentHash(currentHdfcIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, currentVenmoIntentHash, currentHdfcIntentHash]);

  useEffect(() => {
    esl && console.log('refetchVenmoIntentHash: ', refetchVenmoIntentHash);
    esl && console.log('refetchHdfcIntentHash: ', refetchHdfcIntentHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchIntentHash(() => refetchVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setRefetchIntentHash(() =>  refetchHdfcIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoIntentHash, refetchHdfcIntentHash]);

  useEffect(() => {
    esl && console.log('shouldFetchVenmoIntentHash: ', shouldFetchVenmoIntentHash);
    esl && console.log('shouldFetchHdfcIntentHash: ', shouldFetchHdfcIntentHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setShouldFetchIntentHash(shouldFetchVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setShouldFetchIntentHash(shouldFetchHdfcIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, shouldFetchVenmoIntentHash, shouldFetchHdfcIntentHash]);

  useEffect(() => {
    esl && console.log('lastVenmoOnRampTimestamp: ', lastVenmoOnRampTimestamp);
    esl && console.log('lastHdfcOnRampTimestamp: ', lastHdfcOnRampTimestamp);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setLastOnRampTimestamp(lastVenmoOnRampTimestamp);
        break;

      case PaymentPlatform.HDFC:
        setLastOnRampTimestamp(lastHdfcOnRampTimestamp);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, lastVenmoOnRampTimestamp, lastHdfcOnRampTimestamp]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchLastOnRampTimestamp(() => refetchVenmoLastOnRampTimestamp);
        break;

      case PaymentPlatform.HDFC:
        setRefetchLastOnRampTimestamp(() => refetchHdfcLastOnRampTimestamp);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoLastOnRampTimestamp, refetchHdfcLastOnRampTimestamp]);


  /*
   * Ramp State
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDepositCounter: ', refetchVenmoDepositCounter);
    esl && console.log('refetchHdfcDepositCounter: ', refetchHdfcDepositCounter);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchDepositCounter(() => refetchVenmoDepositCounter);
        break;

      case PaymentPlatform.HDFC:
        setRefetchDepositCounter(() => refetchHdfcDepositCounter);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoDepositCounter, refetchHdfcDepositCounter]);

  useEffect(() => {
    esl && console.log('shouldFetchVenmoRampState: ', shouldFetchVenmoRampState);
    esl && console.log('shouldFetchHdfcRampState: ', shouldFetchHdfcRampState);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setShouldFetchRampState(shouldFetchVenmoRampState);
        break;

      case PaymentPlatform.HDFC:
        setShouldFetchRampState(shouldFetchHdfcRampState);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, shouldFetchVenmoRampState, shouldFetchHdfcRampState]);

  useEffect(() => {
    esl && console.log('venmoOnRampCooldownPeriod: ', venmoOnRampCooldownPeriod);
    esl && console.log('hdfcOnRampCooldownPeriod: ', hdfcOnRampCooldownPeriod);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setOnRampCooldownPeriod(venmoOnRampCooldownPeriod);
        break;

      case PaymentPlatform.HDFC:
        setOnRampCooldownPeriod(hdfcOnRampCooldownPeriod);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoOnRampCooldownPeriod, hdfcOnRampCooldownPeriod]);

  return (
    <SwapQuoteContext.Provider
      value={{
        isRegistered,
        refetchDeposits,
        getBestDepositForAmount,
        shouldFetchDeposits,
        currentIntentHash,
        refetchIntentHash,
        shouldFetchIntentHash,
        lastOnRampTimestamp,
        refetchLastOnRampTimestamp,
        refetchDepositCounter,
        shouldFetchRampState,
        onRampCooldownPeriod
      }}
    >
      {children}
    </SwapQuoteContext.Provider>
  );
};

export default SwapQuoteProvider;
