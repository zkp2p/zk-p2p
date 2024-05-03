import { useEffect, useState, ReactNode } from 'react';

import useRemoteNotary from '@hooks/useRemoteNotary';


// import { esl } from '@helpers/constants';
import {
  NotaryConnectionStatusType,
  NotaryConnectionStatus,
  NotaryConfiguration,
  notaryConfigurations
} from '@helpers/types';

import NotarySettingsContext from './NotarySettingsContext';


interface ProvidersProps {
  children: ReactNode;
};

const NotarySettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */

  const [connectionStatus, setConnectionStatus] = useState<NotaryConnectionStatusType>(NotaryConnectionStatus.DEFAULT);
  const [configuration, setConfiguration] = useState<NotaryConfiguration | null>(null);

  const measureLatency = async (url: string): Promise<number> => {
    const startTime = performance.now();
    try {
      const response = await fetch(`${url}/info`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const endTime = performance.now();

      return endTime - startTime;
    } catch (error) {
      console.error(`Failed to measure latency for ${url}: ${error}`);

      return Infinity;
    }
  };

  const determineFastestNotary = async () => {
    const latencies = await Promise.all(
      notaryConfigurations.map(notary => measureLatency(notary.notary))
    );

    const bestIndex = latencies.reduce((lowestIdx, currentLatency, idx, array) => 
      currentLatency !== Infinity && currentLatency < array[lowestIdx] ? idx : lowestIdx, 0);

    const bestNotary = notaryConfigurations[bestIndex];

    if (latencies[bestIndex] !== Infinity) {
      setConfiguration(bestNotary);

      setConnectionStatus(NotaryConnectionStatus.GREEN);

      return bestNotary;
    } else {
      setConnectionStatus(NotaryConnectionStatus.RED);

      return null;
    }
  };

  const {
    uploadSpeed,
    uploadFile
  } = useRemoteNotary({
    notaryUrl: configuration?.notary ?? '',
  });

  /*
   * Hooks
   */

  useEffect(() => {
    if (configuration) {
      uploadFile();
    };
  }, [configuration]);

  /*
   * Component
   */

  return (
    <NotarySettingsContext.Provider
      value={{
        uploadSpeedForNotary: uploadSpeed,
        configuration,
        connectionStatus,
        determineFastestNotary,
      }}
    >
      {children}
    </NotarySettingsContext.Provider>
  );
};

export default NotarySettingsProvider;
