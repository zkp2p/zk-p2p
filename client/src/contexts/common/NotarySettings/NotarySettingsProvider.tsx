import { useEffect, useState, ReactNode } from 'react';

import useRemoteNotaryUploadTest from '@hooks/useRemoteNotaryUploadTest';
// import { esl } from '@helpers/constants';
import {
  NotaryConnectionStatusType,
  NotaryConnectionStatus,
  NotaryConfiguration,
  defaultNotaryConfigurations
} from '@helpers/types';
import useGithubClient from '@hooks/useFetchNotaryList';

import NotarySettingsContext from './NotarySettingsContext';


interface ProvidersProps {
  children: ReactNode;
};

const NotarySettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * Context
   */

  const { fetchData } = useGithubClient();

  /*
   * State
   */

  const [notaryList, setNotaryList] = useState<NotaryConfiguration[] | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<NotaryConnectionStatusType>(NotaryConnectionStatus.DEFAULT);
  const [configuration, setConfiguration] = useState<NotaryConfiguration | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    if (configuration) {
      uploadFile();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  useEffect(() => {
    if (notaryList) {
      determineFastestNotary(notaryList);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notaryList]);

  useEffect(() => {
    const fetchNotaryList = async () => {
      try {
        const fetchNotaryListResponse = await fetchData();
        
        if (fetchNotaryListResponse && fetchNotaryListResponse.notaryList) {
          setNotaryList(fetchNotaryListResponse.notaryList);
        } else {
          setNotaryList(defaultNotaryConfigurations);
        }
      } catch (error) {
        setNotaryList(defaultNotaryConfigurations);
      }
    };

    fetchNotaryList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Helpers
   */

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

  const determineFastestNotary = async (notaries: NotaryConfiguration[]) => {
    const latencies = await Promise.all(
      notaries.map(notary => measureLatency(notary.notary))
    );

    const bestIndex = latencies.reduce((lowestIdx, currentLatency, idx, array) => 
      currentLatency !== Infinity && currentLatency < array[lowestIdx] ? idx : lowestIdx, 0);

    const bestNotary = notaries[bestIndex];

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
    uploadTime,
    uploadFile
  } = useRemoteNotaryUploadTest({
    notaryUrl: configuration?.notary ?? '',
  });

  /*
   * Provider
   */

  return (
    <NotarySettingsContext.Provider
      value={{
        uploadTimeForNotary: uploadTime,
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
