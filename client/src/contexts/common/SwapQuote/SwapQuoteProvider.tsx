import React, { useEffect, useState, ReactNode } from 'react';

import { IndicativeQuote } from '@helpers/types';
import {
  esl,
  MAX_USDC_TRANSFER_SIZE_GARANTI,
  MAX_USDC_TRANSFER_SIZE_HDFC,
  MAX_USDC_TRANSFER_SIZE_VENMO,
  MAX_USDC_TRANSFER_SIZE_WISE,
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

// Wise
import useWiseLiquidity from '@hooks/wise/useLiquidity';
import useWiseOnRamperIntents from '@hooks/wise/useOnRamperIntents';
import useWiseRampState from "@hooks/wise/useRampState";
import useWiseRegistration from '@hooks/wise/useRegistration';

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

  // Wise
  const {
    isRegistered: isRegisteredOnWise,
    accountId: wiseAccountId
  } = useWiseRegistration();
  const {
    refetchDeposits: refetchWiseDeposits,
    getBestDepositForAmount: getBestWiseDepositForAmount,
    getDepositForMaxAvailableTransferSize: getWiseDepositForMaxAvailableTransferSize,
    shouldFetchDeposits: shouldFetchWiseDeposits
  } = useWiseLiquidity();
  const {
    refetchDepositCounter: refetchWiseDepositCounter,
    shouldFetchRampState: shouldFetchWiseRampState,
    onRampCooldownPeriod: wiseOnRampCooldownPeriod
  } = useWiseRampState();
  const {
    currentIntentHash: currentWiseIntentHash,
    refetchIntentHash: refetchWiseIntentHash,
    refetchIntentHashAsUint: refetchWiseIntentHashAsUint,
    shouldFetchIntentHash: shouldFetchWiseIntentHash,
    lastOnRampTimestamp: lastWiseOnRampTimestamp,
    refetchLastOnRampTimestamp: refetchWiseLastOnRampTimestamp
  } = useWiseOnRamperIntents();

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
  const [refetchIntentHashAsUint, setRefetchIntentHashAsUint] = useState<(() => void) | null>(null);
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

      case PaymentPlatform.WISE:
        setMaxTransferSize(MAX_USDC_TRANSFER_SIZE_WISE);
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
    esl && console.log('isRegisteredOnWise: ', isRegisteredOnWise);

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

      case PaymentPlatform.WISE:
        setIsRegistered(isRegisteredOnWise);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, isRegisteredOnVenmo, isRegisteredOnHdfc, isRegisteredOnGaranti, isRegisteredOnWise]);

  useEffect(() => {
    esl && console.log('venmoRegistrationHash: ', venmoRegistrationHash);
    esl && console.log('hdfcRegistrationHash: ', hdfcRegistrationHash);
    esl && console.log('garantiRegistrationHash: ', garantiRegistrationHash);
    esl && console.log('wiseAccountId: ', wiseAccountId);

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

      case PaymentPlatform.WISE:
        setRegistrationHash(wiseAccountId);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      hdfcRegistrationHash,
      venmoRegistrationHash,
      garantiRegistrationHash,
      wiseAccountId
    ]
  );

  /*
   * Liquidity
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDeposits: ', refetchVenmoDeposits);
    esl && console.log('refetchHdfcDeposits: ', refetchHdfcDeposits);
    esl && console.log('refetchGarantiDeposits: ', refetchGarantiDeposits);
    esl && console.log('refetchWiseDeposits: ', refetchWiseDeposits);

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

      case PaymentPlatform.WISE:
        setRefetchDeposits(() => refetchWiseDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoDeposits, refetchHdfcDeposits, refetchGarantiDeposits, refetchWiseDeposits]);

  useEffect(() => {
    esl && console.log('getBestVenmoDepositForAmount: ', getBestVenmoDepositForAmount);
    esl && console.log('getBestHdfcDepositForAmount: ', getBestHdfcDepositForAmount);
    esl && console.log('getBestGarantiDepositForAmount: ', getBestGarantiDepositForAmount);
    esl && console.log('getBestWiseDepositForAmount: ', getBestWiseDepositForAmount);

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

      case PaymentPlatform.WISE:
        setGetBestDepositForAmount(() => getBestWiseDepositForAmount as any);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      getBestVenmoDepositForAmount,
      getBestHdfcDepositForAmount,
      getBestGarantiDepositForAmount,
      getBestWiseDepositForAmount
    ]
  );

  useEffect(() => {
    esl && console.log('getVenmoDepositForMaxAvailableTransferSize: ', getVenmoDepositForMaxAvailableTransferSize);
    esl && console.log('getHdfcDepositForMaxAvailableTransferSize: ', getHdfcDepositForMaxAvailableTransferSize);
    esl && console.log('getGarantiDepositForMaxAvailableTransferSize: ', getGarantiDepositForMaxAvailableTransferSize);
    esl && console.log('getWiseDepositForMaxAvailableTransferSize: ', getWiseDepositForMaxAvailableTransferSize);

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

      case PaymentPlatform.WISE:
        setGetDepositForMaxAvailableTransferSize(() => getWiseDepositForMaxAvailableTransferSize as any);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      getVenmoDepositForMaxAvailableTransferSize,
      getHdfcDepositForMaxAvailableTransferSize,
      getGarantiDepositForMaxAvailableTransferSize,
      getWiseDepositForMaxAvailableTransferSize
    ]
  );

  useEffect(() => {
    esl && console.log('shouldFetchVenmoDeposits: ', shouldFetchVenmoDeposits);
    esl && console.log('shouldFetchHdfcDeposits: ', shouldFetchHdfcDeposits);
    esl && console.log('shouldFetchGarantiDeposits: ', shouldFetchGarantiDeposits);
    esl && console.log('shouldFetchWiseDeposits: ', shouldFetchWiseDeposits);

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

      case PaymentPlatform.WISE:
        setShouldFetchDeposits(shouldFetchWiseDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      shouldFetchVenmoDeposits,
      shouldFetchHdfcDeposits,
      shouldFetchGarantiDeposits,
      shouldFetchWiseDeposits
    ]
  );
  

  /*
   * On Ramper Intents
   */

  useEffect(() => {
    esl && console.log('currentVenmoIntentHash: ', currentVenmoIntentHash);
    esl && console.log('currentHdfcIntentHash: ', currentHdfcIntentHash);
    esl && console.log('currentGarantiIntentHash: ', currentGarantiIntentHash);
    esl && console.log('currentWiseIntentHash: ', currentWiseIntentHash);

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

      case PaymentPlatform.WISE:
        setCurrentIntentHash(currentWiseIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      currentVenmoIntentHash,
      currentHdfcIntentHash,
      currentGarantiIntentHash,
      currentWiseIntentHash
    ]
  );

  useEffect(() => {
    esl && console.log('refetchVenmoIntentHash: ', refetchVenmoIntentHash);
    esl && console.log('refetchHdfcIntentHash: ', refetchHdfcIntentHash);
    esl && console.log('refetchGarantiIntentHash: ', refetchGarantiIntentHash);
    esl && console.log('refetchWiseIntentHash: ', refetchWiseIntentHash);

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

      case PaymentPlatform.WISE:
        setRefetchIntentHash(() =>  refetchWiseIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      refetchVenmoIntentHash,
      refetchHdfcIntentHash,
      refetchGarantiIntentHash,
      refetchWiseIntentHash
    ]
  );

  useEffect(() => {
    esl && console.log('refetchWiseIntentHashAsUint: ', refetchWiseIntentHashAsUint);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
      case PaymentPlatform.HDFC:
      case PaymentPlatform.GARANTI:
        setRefetchIntentHashAsUint(() => {});
        break;

      case PaymentPlatform.WISE:
        setRefetchIntentHashAsUint(() =>  refetchWiseIntentHashAsUint);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      refetchWiseIntentHashAsUint
    ]
  );

  useEffect(() => {
    esl && console.log('shouldFetchVenmoIntentHash: ', shouldFetchVenmoIntentHash);
    esl && console.log('shouldFetchHdfcIntentHash: ', shouldFetchHdfcIntentHash);
    esl && console.log('shouldFetchGarantiIntentHash: ', shouldFetchGarantiIntentHash);
    esl && console.log('shouldFetchWiseIntentHash: ', shouldFetchWiseIntentHash);

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

      case PaymentPlatform.WISE:
        setShouldFetchIntentHash(shouldFetchWiseIntentHash);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      shouldFetchVenmoIntentHash,
      shouldFetchHdfcIntentHash,
      shouldFetchGarantiIntentHash,
      shouldFetchWiseIntentHash
    ]
  );

  useEffect(() => {
    esl && console.log('lastVenmoOnRampTimestamp: ', lastVenmoOnRampTimestamp);
    esl && console.log('lastHdfcOnRampTimestamp: ', lastHdfcOnRampTimestamp);
    esl && console.log('lastGarantiOnRampTimestamp: ', lastGarantiOnRampTimestamp);
    esl && console.log('lastWiseOnRampTimestamp: ', lastWiseOnRampTimestamp);

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

      case PaymentPlatform.WISE:
        setLastOnRampTimestamp(lastWiseOnRampTimestamp);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      lastVenmoOnRampTimestamp,
      lastHdfcOnRampTimestamp,
      lastGarantiOnRampTimestamp,
      lastWiseOnRampTimestamp
    ]
  );

  useEffect(() => {
    esl && console.log('refetchVenmoLastOnRampTimestamp: ', refetchVenmoLastOnRampTimestamp);
    esl && console.log('refetchHdfcLastOnRampTimestamp: ', refetchHdfcLastOnRampTimestamp);
    esl && console.log('refetchGarantiLastOnRampTimestamp: ', refetchGarantiLastOnRampTimestamp);
    esl && console.log('refetchWiseLastOnRampTimestamp: ', refetchWiseLastOnRampTimestamp);

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

      case PaymentPlatform.WISE:
        setRefetchLastOnRampTimestamp(() => refetchWiseLastOnRampTimestamp);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      refetchVenmoLastOnRampTimestamp,
      refetchHdfcLastOnRampTimestamp,
      refetchGarantiLastOnRampTimestamp,
      refetchWiseLastOnRampTimestamp
    ]
  );


  /*
   * Ramp State
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDepositCounter: ', refetchVenmoDepositCounter);
    esl && console.log('refetchHdfcDepositCounter: ', refetchHdfcDepositCounter);
    esl && console.log('refetchGarantiDepositCounter: ', refetchGarantiDepositCounter);
    esl && console.log('refetchWiseDepositCounter: ', refetchWiseDepositCounter);

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

      case PaymentPlatform.WISE:
        setRefetchDepositCounter(() => refetchWiseDepositCounter);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      refetchVenmoDepositCounter,
      refetchHdfcDepositCounter,
      refetchGarantiDepositCounter,
      refetchWiseDepositCounter
    ]
  );

  useEffect(() => {
    esl && console.log('shouldFetchVenmoRampState: ', shouldFetchVenmoRampState);
    esl && console.log('shouldFetchHdfcRampState: ', shouldFetchHdfcRampState);
    esl && console.log('shouldFetchGarantiRampState: ', shouldFetchGarantiRampState);
    esl && console.log('shouldFetchWiseRampState: ', shouldFetchWiseRampState);

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

      case PaymentPlatform.WISE:
        setShouldFetchRampState(shouldFetchWiseRampState);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      shouldFetchVenmoRampState,
      shouldFetchHdfcRampState,
      shouldFetchGarantiRampState,
      shouldFetchWiseRampState
    ]
  );

  useEffect(() => {
    esl && console.log('venmoOnRampCooldownPeriod: ', venmoOnRampCooldownPeriod);
    esl && console.log('hdfcOnRampCooldownPeriod: ', hdfcOnRampCooldownPeriod);
    esl && console.log('garantiOnRampCooldownPeriod: ', garantiOnRampCooldownPeriod);
    esl && console.log('wiseOnRampCooldownPeriod: ', wiseOnRampCooldownPeriod);

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

      case PaymentPlatform.WISE:
        setOnRampCooldownPeriod(wiseOnRampCooldownPeriod);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      venmoOnRampCooldownPeriod,
      hdfcOnRampCooldownPeriod,
      garantiOnRampCooldownPeriod,
      wiseOnRampCooldownPeriod
    ]
  );

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
        refetchIntentHashAsUint,
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
