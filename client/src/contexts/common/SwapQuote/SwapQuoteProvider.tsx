import React, { useEffect, useState, ReactNode } from 'react';

import { IndicativeQuote } from '@helpers/types';
import {
  esl,
  MAX_USDC_TRANSFER_SIZE_GARANTI,
  MAX_USDC_TRANSFER_SIZE_HDFC,
  MAX_USDC_TRANSFER_SIZE_VENMO,
  ZERO
} from '@helpers/constants';
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

// Garanti
import useGarantiLiquidity from '@hooks/garanti/useLiquidity';
import useGarantiOnRamperIntents from '@hooks/garanti/useOnRamperIntents';
import useGarantiRampState from "@hooks/garanti/useRampState";
import useGarantiRegistration from '@hooks/garanti/useRegistration';

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
    isRegistered: isRegisteredOnVenmo,
    registrationHash: venmoRegistrationHash
  } = useVenmoRegistration();
  const {
    refetchDeposits: refetchVenmoDeposits,
    getBestDepositForAmount: getBestVenmoDepositForAmount,
    getDepositForMaxAvailableTransferSize: getVenmoDepositForMaxAvailableTransferSize,
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
    isRegistered: isRegisteredOnHdfc,
    registrationHash: hdfcRegistrationHash
  } = useHdfcRegistration();
  const {
    refetchDeposits: refetchHdfcDeposits,
    getBestDepositForAmount: getBestHdfcDepositForAmount,
    getDepositForMaxAvailableTransferSize: getHdfcDepositForMaxAvailableTransferSize,
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

  // Garanti
  const {
    isRegistered: isRegisteredOnGaranti,
    registrationHash: garantiRegistrationHash
  } = useGarantiRegistration();
  const {
    refetchDeposits: refetchGarantiDeposits,
    getBestDepositForAmount: getBestGarantiDepositForAmount,
    getDepositForMaxAvailableTransferSize: getGarantiDepositForMaxAvailableTransferSize,
    shouldFetchDeposits: shouldFetchGarantiDeposits
  } = useGarantiLiquidity();
  const {
    refetchDepositCounter: refetchGarantiDepositCounter,
    shouldFetchRampState: shouldFetchGarantiRampState,
    onRampCooldownPeriod: garantiOnRampCooldownPeriod
  } = useGarantiRampState();
  const {
    currentIntentHash: currentGarantiIntentHash,
    refetchIntentHash: refetchGarantiIntentHash,
    shouldFetchIntentHash: shouldFetchGarantiIntentHash,
    lastOnRampTimestamp: lastGarantiOnRampTimestamp,
    refetchLastOnRampTimestamp: refetchGarantiLastOnRampTimestamp
  } = useGarantiOnRamperIntents();

  /*
   * State
   */

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [registrationHash, setRegistrationHash] = useState<string | null>(null);

  const [refetchDeposits, setRefetchDeposits] = useState<(() => void) | null>(null);
  const [getBestDepositForAmount, setGetBestDepositForAmount] = useState<((requestedOnRampInputAmount: string) => IndicativeQuote) | null>(null);
  const [getDepositForMaxAvailableTransferSize, setGetDepositForMaxAvailableTransferSize] = useState<(() => IndicativeQuote) | null>(null);
  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  const [refetchDepositCounter, setRefetchDepositCounter] = useState<(() => void) | null>(null);
  const [shouldFetchRampState, setShouldFetchRampState] = useState<boolean>(false);
  const [onRampCooldownPeriod, setOnRampCooldownPeriod] = useState<bigint | null>(null);
  
  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [refetchIntentHash, setRefetchIntentHash] = useState<(() => void) | null>(null);
  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);
  const [lastOnRampTimestamp, setLastOnRampTimestamp] = useState<bigint | null>(null);
  const [refetchLastOnRampTimestamp, setRefetchLastOnRampTimestamp] = useState<(() => void) | null>(null);

  const [maxTransferSize, setMaxTransferSize] = useState<bigint>(ZERO);

  /*
   * Miscellaneous
   */

  useEffect(() => {
    esl && console.log('paymentPlatform: ', paymentPlatform);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setMaxTransferSize(MAX_USDC_TRANSFER_SIZE_VENMO);
        break;

      case PaymentPlatform.HDFC:
        setMaxTransferSize(MAX_USDC_TRANSFER_SIZE_HDFC);
        break;

      case PaymentPlatform.GARANTI:
        setMaxTransferSize(MAX_USDC_TRANSFER_SIZE_GARANTI);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform]);

  /*
   * Registration
   */

  useEffect(() => {
    esl && console.log('isRegisteredOnVenmo: ', isRegisteredOnVenmo);
    esl && console.log('isRegisteredOnHdfc: ', isRegisteredOnHdfc);
    esl && console.log('isRegisteredOnGaranti: ', isRegisteredOnGaranti);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setIsRegistered(isRegisteredOnVenmo);

        break;

      case PaymentPlatform.HDFC:
        setIsRegistered(isRegisteredOnHdfc);
        break;

      case PaymentPlatform.GARANTI:
        setIsRegistered(isRegisteredOnGaranti);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, isRegisteredOnVenmo, isRegisteredOnHdfc, isRegisteredOnGaranti]);

  useEffect(() => {
    esl && console.log('venmoRegistrationHash: ', venmoRegistrationHash);
    esl && console.log('hdfcRegistrationHash: ', hdfcRegistrationHash);
    esl && console.log('garantiRegistrationHash: ', garantiRegistrationHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRegistrationHash(venmoRegistrationHash);
        
        break;

      case PaymentPlatform.HDFC:
        setRegistrationHash(hdfcRegistrationHash);
        break;

      case PaymentPlatform.GARANTI:
        setRegistrationHash(garantiRegistrationHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, hdfcRegistrationHash, venmoRegistrationHash, garantiRegistrationHash]);

  /*
   * Liquidity
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDeposits: ', refetchVenmoDeposits);
    esl && console.log('refetchHdfcDeposits: ', refetchHdfcDeposits);
    esl && console.log('refetchGarantiDeposits: ', refetchGarantiDeposits);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchDeposits(() => refetchVenmoDeposits);
        break;

      case PaymentPlatform.HDFC:
        setRefetchDeposits(() => refetchHdfcDeposits);
        break;

      case PaymentPlatform.GARANTI:
        setRefetchDeposits(() => refetchGarantiDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoDeposits, refetchHdfcDeposits, refetchGarantiDeposits]);

  useEffect(() => {
    esl && console.log('getBestVenmoDepositForAmount: ', getBestVenmoDepositForAmount);
    esl && console.log('getBestHdfcDepositForAmount: ', getBestHdfcDepositForAmount);
    esl && console.log('getBestGarantiDepositForAmount: ', getBestGarantiDepositForAmount);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setGetBestDepositForAmount(() => getBestVenmoDepositForAmount as any);
        break;

      case PaymentPlatform.HDFC:
        setGetBestDepositForAmount(() => getBestHdfcDepositForAmount as any);
        break;

      case PaymentPlatform.GARANTI:
        setGetBestDepositForAmount(() => getBestGarantiDepositForAmount as any);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, getBestVenmoDepositForAmount, getBestHdfcDepositForAmount, getBestGarantiDepositForAmount]);

  useEffect(() => {
    esl && console.log('getVenmoDepositForMaxAvailableTransferSize: ', getVenmoDepositForMaxAvailableTransferSize);
    esl && console.log('getHdfcDepositForMaxAvailableTransferSize: ', getHdfcDepositForMaxAvailableTransferSize);
    esl && console.log('getGarantiDepositForMaxAvailableTransferSize: ', getGarantiDepositForMaxAvailableTransferSize);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setGetDepositForMaxAvailableTransferSize(() => getVenmoDepositForMaxAvailableTransferSize as any);
        break;

      case PaymentPlatform.HDFC:
        setGetDepositForMaxAvailableTransferSize(() => getHdfcDepositForMaxAvailableTransferSize as any);
        break;

      case PaymentPlatform.GARANTI:
        setGetDepositForMaxAvailableTransferSize(() => getGarantiDepositForMaxAvailableTransferSize as any);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, getVenmoDepositForMaxAvailableTransferSize, getHdfcDepositForMaxAvailableTransferSize, getGarantiDepositForMaxAvailableTransferSize]);

  useEffect(() => {
    esl && console.log('shouldFetchVenmoDeposits: ', shouldFetchVenmoDeposits);
    esl && console.log('shouldFetchHdfcDeposits: ', shouldFetchHdfcDeposits);
    esl && console.log('shouldFetchHdfcDeposits: ', shouldFetchGarantiDeposits);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setShouldFetchDeposits(shouldFetchVenmoDeposits);
        break;

      case PaymentPlatform.HDFC:
        setShouldFetchDeposits(shouldFetchHdfcDeposits);
        break;

      case PaymentPlatform.GARANTI:
        setShouldFetchDeposits(shouldFetchGarantiDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, shouldFetchVenmoDeposits, shouldFetchHdfcDeposits, shouldFetchGarantiDeposits]);
  

  /*
   * On Ramper Intents
   */

  useEffect(() => {
    esl && console.log('currentVenmoIntentHash: ', currentVenmoIntentHash);
    esl && console.log('currentHdfcIntentHash: ', currentHdfcIntentHash);
    esl && console.log('currentGarantiIntentHash: ', currentGarantiIntentHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setCurrentIntentHash(currentVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setCurrentIntentHash(currentHdfcIntentHash);
        break;

      case PaymentPlatform.GARANTI:
        setCurrentIntentHash(currentGarantiIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, currentVenmoIntentHash, currentHdfcIntentHash, currentGarantiIntentHash]);

  useEffect(() => {
    esl && console.log('refetchVenmoIntentHash: ', refetchVenmoIntentHash);
    esl && console.log('refetchHdfcIntentHash: ', refetchHdfcIntentHash);
    esl && console.log('refetchGarantiIntentHash: ', refetchGarantiIntentHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchIntentHash(() => refetchVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setRefetchIntentHash(() =>  refetchHdfcIntentHash);
        break;

      case PaymentPlatform.GARANTI:
        setRefetchIntentHash(() =>  refetchGarantiIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoIntentHash, refetchHdfcIntentHash, refetchGarantiIntentHash]);

  useEffect(() => {
    esl && console.log('shouldFetchVenmoIntentHash: ', shouldFetchVenmoIntentHash);
    esl && console.log('shouldFetchHdfcIntentHash: ', shouldFetchHdfcIntentHash);
    esl && console.log('shouldFetchGarantiIntentHash: ', shouldFetchGarantiIntentHash);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setShouldFetchIntentHash(shouldFetchVenmoIntentHash);
        break;

      case PaymentPlatform.HDFC:
        setShouldFetchIntentHash(shouldFetchHdfcIntentHash);
        break;

      case PaymentPlatform.GARANTI:
        setShouldFetchIntentHash(shouldFetchGarantiIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, shouldFetchVenmoIntentHash, shouldFetchHdfcIntentHash, shouldFetchGarantiIntentHash]);

  useEffect(() => {
    esl && console.log('lastVenmoOnRampTimestamp: ', lastVenmoOnRampTimestamp);
    esl && console.log('lastHdfcOnRampTimestamp: ', lastHdfcOnRampTimestamp);
    esl && console.log('lastGarantiOnRampTimestamp: ', lastGarantiOnRampTimestamp);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setLastOnRampTimestamp(lastVenmoOnRampTimestamp);
        break;

      case PaymentPlatform.HDFC:
        setLastOnRampTimestamp(lastHdfcOnRampTimestamp);
        break;

      case PaymentPlatform.GARANTI:
        setLastOnRampTimestamp(lastGarantiOnRampTimestamp);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, lastVenmoOnRampTimestamp, lastHdfcOnRampTimestamp, lastGarantiOnRampTimestamp]);

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchLastOnRampTimestamp(() => refetchVenmoLastOnRampTimestamp);
        break;

      case PaymentPlatform.HDFC:
        setRefetchLastOnRampTimestamp(() => refetchHdfcLastOnRampTimestamp);
        break;

      case PaymentPlatform.GARANTI:
        setRefetchLastOnRampTimestamp(() => refetchGarantiLastOnRampTimestamp);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoLastOnRampTimestamp, refetchHdfcLastOnRampTimestamp, refetchGarantiLastOnRampTimestamp]);


  /*
   * Ramp State
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDepositCounter: ', refetchVenmoDepositCounter);
    esl && console.log('refetchHdfcDepositCounter: ', refetchHdfcDepositCounter);
    esl && console.log('refetchGarantiDepositCounter: ', refetchGarantiDepositCounter);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setRefetchDepositCounter(() => refetchVenmoDepositCounter);
        break;

      case PaymentPlatform.HDFC:
        setRefetchDepositCounter(() => refetchHdfcDepositCounter);
        break;

      case PaymentPlatform.GARANTI:
        setRefetchDepositCounter(() => refetchGarantiDepositCounter);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoDepositCounter, refetchHdfcDepositCounter, refetchGarantiDepositCounter]);

  useEffect(() => {
    esl && console.log('shouldFetchVenmoRampState: ', shouldFetchVenmoRampState);
    esl && console.log('shouldFetchHdfcRampState: ', shouldFetchHdfcRampState);
    esl && console.log('shouldFetchGarantiRampState: ', shouldFetchGarantiRampState);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setShouldFetchRampState(shouldFetchVenmoRampState);
        break;

      case PaymentPlatform.HDFC:
        setShouldFetchRampState(shouldFetchHdfcRampState);
        break;

      case PaymentPlatform.GARANTI:
        setShouldFetchRampState(shouldFetchGarantiRampState);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, shouldFetchVenmoRampState, shouldFetchHdfcRampState, shouldFetchGarantiRampState]);

  useEffect(() => {
    esl && console.log('venmoOnRampCooldownPeriod: ', venmoOnRampCooldownPeriod);
    esl && console.log('hdfcOnRampCooldownPeriod: ', hdfcOnRampCooldownPeriod);
    esl && console.log('garantiOnRampCooldownPeriod: ', garantiOnRampCooldownPeriod);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        setOnRampCooldownPeriod(venmoOnRampCooldownPeriod);
        break;

      case PaymentPlatform.HDFC:
        setOnRampCooldownPeriod(hdfcOnRampCooldownPeriod);
        break;
      
      case PaymentPlatform.GARANTI:
        setOnRampCooldownPeriod(garantiOnRampCooldownPeriod);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, venmoOnRampCooldownPeriod, hdfcOnRampCooldownPeriod, garantiOnRampCooldownPeriod]);

  return (
    <SwapQuoteContext.Provider
      value={{
        isRegistered,
        registrationHash,
        refetchDeposits,
        getBestDepositForAmount,
        getDepositForMaxAvailableTransferSize,
        shouldFetchDeposits,
        currentIntentHash,
        refetchIntentHash,
        shouldFetchIntentHash,
        lastOnRampTimestamp,
        refetchLastOnRampTimestamp,
        refetchDepositCounter,
        shouldFetchRampState,
        onRampCooldownPeriod,
        maxTransferSize
      }}
    >
      {children}
    </SwapQuoteContext.Provider>
  );
};

export default SwapQuoteProvider;
