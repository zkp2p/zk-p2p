import React, { useEffect, useState, ReactNode } from 'react';

import { IndicativeQuote } from '@helpers/types';
import {
  esl,
  MAX_USDC_TRANSFER_SIZE_GARANTI,
  MAX_USDC_TRANSFER_SIZE_HDFC,
  MAX_USDC_TRANSFER_SIZE_VENMO,
  MAX_USDC_TRANSFER_SIZE_REVOLUT,
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
import useRevolutLiquidity from '@hooks/revolut/useLiquidity';
import useRevolutOnRamperIntents from '@hooks/revolut/useOnRamperIntents';
import useRevolutRampState from "@hooks/revolut/useRampState";
import useRevolutRegistration from '@hooks/revolut/useRegistration';

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
    accountId: revolutAccountId
  } = useRevolutRegistration();
  const {
    refetchDeposits: refetchRevolutDeposits,
    getBestDepositForAmount: getBestWiseDepositForAmount,
    getDepositForMaxAvailableTransferSize: getWiseDepositForMaxAvailableTransferSize,
    shouldFetchDeposits: shouldFetchWiseDeposits
  } = useRevolutLiquidity();
  const {
    refetchDepositCounter: refetchRevolutDepositCounter,
    shouldFetchRampState: shouldFetchWiseRampState,
    onRampCooldownPeriod: revolutOnRampCooldownPeriod
  } = useRevolutRampState();
  const {
    currentIntentHash: currentWiseIntentHash,
    refetchIntentHash: refetchRevolutIntentHash,
    refetchIntentHashAsUint: refetchRevolutIntentHashAsUint,
    shouldFetchIntentHash: shouldFetchWiseIntentHash,
    lastOnRampTimestamp: lastWiseOnRampTimestamp,
    refetchLastOnRampTimestamp: refetchRevolutLastOnRampTimestamp
  } = useRevolutOnRamperIntents();

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

      case PaymentPlatform.REVOLUT:
        setMaxTransferSize(MAX_USDC_TRANSFER_SIZE_REVOLUT);
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

      case PaymentPlatform.REVOLUT:
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
    esl && console.log('revolutAccountId: ', revolutAccountId);

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

      case PaymentPlatform.REVOLUT:
        setRegistrationHash(revolutAccountId);
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
      revolutAccountId
    ]
  );

  /*
   * Liquidity
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDeposits: ', refetchVenmoDeposits);
    esl && console.log('refetchHdfcDeposits: ', refetchHdfcDeposits);
    esl && console.log('refetchGarantiDeposits: ', refetchGarantiDeposits);
    esl && console.log('refetchRevolutDeposits: ', refetchRevolutDeposits);

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

      case PaymentPlatform.REVOLUT:
        setRefetchDeposits(() => refetchRevolutDeposits);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform, refetchVenmoDeposits, refetchHdfcDeposits, refetchGarantiDeposits, refetchRevolutDeposits]);

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

      case PaymentPlatform.REVOLUT:
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

      case PaymentPlatform.REVOLUT:
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

      case PaymentPlatform.REVOLUT:
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

      case PaymentPlatform.REVOLUT:
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
    esl && console.log('refetchRevolutIntentHash: ', refetchRevolutIntentHash);

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

      case PaymentPlatform.REVOLUT:
        setRefetchIntentHash(() =>  refetchRevolutIntentHash);
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
      refetchRevolutIntentHash
    ]
  );

  useEffect(() => {
    esl && console.log('refetchRevolutIntentHashAsUint: ', refetchRevolutIntentHashAsUint);

    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
      case PaymentPlatform.HDFC:
      case PaymentPlatform.GARANTI:
        setRefetchIntentHashAsUint(() => {});
        break;

      case PaymentPlatform.REVOLUT:
        setRefetchIntentHashAsUint(() =>  refetchRevolutIntentHashAsUint);
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      refetchRevolutIntentHashAsUint
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

      case PaymentPlatform.REVOLUT:
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

      case PaymentPlatform.REVOLUT:
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
    esl && console.log('refetchRevolutLastOnRampTimestamp: ', refetchRevolutLastOnRampTimestamp);

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

      case PaymentPlatform.REVOLUT:
        setRefetchLastOnRampTimestamp(() => refetchRevolutLastOnRampTimestamp);
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
      refetchRevolutLastOnRampTimestamp
    ]
  );


  /*
   * Ramp State
   */

  useEffect(() => {
    esl && console.log('refetchVenmoDepositCounter: ', refetchVenmoDepositCounter);
    esl && console.log('refetchHdfcDepositCounter: ', refetchHdfcDepositCounter);
    esl && console.log('refetchGarantiDepositCounter: ', refetchGarantiDepositCounter);
    esl && console.log('refetchRevolutDepositCounter: ', refetchRevolutDepositCounter);

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

      case PaymentPlatform.REVOLUT:
        setRefetchDepositCounter(() => refetchRevolutDepositCounter);
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
      refetchRevolutDepositCounter
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

      case PaymentPlatform.REVOLUT:
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
    esl && console.log('revolutOnRampCooldownPeriod: ', revolutOnRampCooldownPeriod);

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

      case PaymentPlatform.REVOLUT:
        setOnRampCooldownPeriod(revolutOnRampCooldownPeriod);
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
      revolutOnRampCooldownPeriod
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
