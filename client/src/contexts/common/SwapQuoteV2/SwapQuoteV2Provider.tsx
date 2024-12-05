import React, { useEffect, useState, ReactNode } from 'react';

import { IndicativeQuote } from '@helpers/types';
import { esl } from '@helpers/constants';
import usePlatformSettings from '@hooks/usePlatformSettings';
import useLiquidity from '@hooks/escrow/useLiquidity';
import useOnRamperIntents from '@hooks/escrow/useOnRamperIntents';
import useEscrowState from "@hooks/escrow/useEscrowState";

import SwapQuoteV2Context from './SwapQuoteV2Context';


interface ProvidersProps {
  children: ReactNode;
}

const SwapQuoteV2Provider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  const {
    refetchDeposits: refetchEscrowDeposits,
    getBestDepositForAmount: getBestEscrowDepositForAmount,
    shouldFetchDeposits: shouldFetchEscrowDeposits
  } = useLiquidity();
  const {
    refetchDepositCounter: refetchEscrowDepositCounter,
    shouldFetchEscrowState,
    
  } = useEscrowState();
  const {
    currentIntentHash: currentEscrowIntentHash,
    refetchIntentHash: refetchEscrowIntentHash,
    shouldFetchIntentHash: shouldFetchEscrowIntentHash,
  } = useOnRamperIntents();

  /*
   * State
   */

  const [refetchDeposits, setRefetchDeposits] = useState<(() => void) | null>(null);
  const [getBestDepositForAmount, setGetBestDepositForAmount] = useState<((requestedOnRampInputAmount: string) => IndicativeQuote) | null>(null);
  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  const [refetchDepositCounter, setRefetchDepositCounter] = useState<(() => void) | null>(null);
  const [shouldFetchRampState, setShouldFetchRampState] = useState<boolean>(false);
  
  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [refetchIntentHash, setRefetchIntentHash] = useState<(() => void) | null>(null);
  const [refetchIntentHashAsUint, setRefetchIntentHashAsUint] = useState<(() => void) | null>(null);
  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);

  /*
   * Liquidity
   */

  useEffect(() => {
    esl && console.log('refetchEscrowDeposits: ', refetchEscrowDeposits);
    setRefetchDeposits(() => refetchEscrowDeposits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform]);

  useEffect(() => {
    esl && console.log('getBestEscrowDepositForAmount: ', getBestEscrowDepositForAmount);

    setGetBestDepositForAmount(() => getBestEscrowDepositForAmount as any);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      getBestEscrowDepositForAmount,
    ]
  );

  useEffect(() => {
    esl && console.log('shouldFetchEscrowDeposits: ', shouldFetchEscrowDeposits);
    
    setShouldFetchDeposits(shouldFetchEscrowDeposits);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      shouldFetchEscrowDeposits,
    ]
  );
  

  /*
   * On Ramper Intents
   */

  useEffect(() => {
    esl && console.log('currentEscrowIntentHash: ', currentEscrowIntentHash);

    setCurrentIntentHash(currentEscrowIntentHash);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      currentEscrowIntentHash,
    ]
  );

  useEffect(() => {
    esl && console.log('refetchEscrowIntentHash: ', refetchEscrowIntentHash);

    setRefetchIntentHash(() => refetchEscrowIntentHash);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      refetchEscrowIntentHash,
    ]
  );

  useEffect(() => {
    esl && console.log('shouldFetchEscrowIntentHash: ', shouldFetchEscrowIntentHash);

    setShouldFetchIntentHash(shouldFetchEscrowIntentHash);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      paymentPlatform,
      shouldFetchEscrowIntentHash,
    ]
  );

  /*
   * Escrow State
   */

  useEffect(() => {
    esl && console.log('refetchEscrowDepositCounter: ', refetchEscrowDepositCounter);

    setRefetchDepositCounter(() => refetchEscrowDepositCounter);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform]);

  useEffect(() => {
    esl && console.log('shouldFetchEscrowState: ', shouldFetchEscrowState);

    setShouldFetchRampState(shouldFetchEscrowState);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPlatform]);

  return (
    <SwapQuoteV2Context.Provider
      value={{
        refetchDeposits,
        getBestDepositForAmount,
        shouldFetchDeposits,
        currentIntentHash,
        refetchIntentHash,
        refetchIntentHashAsUint,
        shouldFetchIntentHash,
        refetchDepositCounter,
        shouldFetchRampState,
      }}
    >
      {children}
    </SwapQuoteV2Context.Provider>
  );
};

export default SwapQuoteV2Provider;
