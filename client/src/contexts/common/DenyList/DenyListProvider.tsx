import React, { useCallback, useState, ReactNode } from 'react';

import useGithubClient from '@hooks/useGithubClient';


import DenyListContext from './DenyListContext';

interface ProvidersProps {
  children: ReactNode;
}

const DenyListProvider = ({ children }: ProvidersProps) => {
  /*
   * Context
   */

  const { fetchData } = useGithubClient();

  /*
   * State
   */

  const [hdfcDepositorDenyList, setHdfcDepositorDenyList] = useState<string[] | null>(null);
  const [garantiDepositorDenyList, setGarantiDepositorDenyList] = useState<string[] | null>(null);

  const fetchHdfcDepositoryDenyList = useCallback(async () => {
    const HDFC_DENY_LIST_URL = process.env.HDFC_DENY_LIST_URL;
    if (!HDFC_DENY_LIST_URL) {
      throw new Error(" HDFC_DENY_LIST_URL environment variable is not defined.");
    }

    const cachedData = localStorage.getItem('hdfcDepositorDenyList');
    const now = new Date();

    if (cachedData) {
      const { data: storedData, timestamp } = JSON.parse(cachedData);

      if (now.getTime() - timestamp < 60000) { // 1 min
        setHdfcDepositorDenyList(storedData);

        return storedData;
      }
    }

    const fetchedData = await fetchData(HDFC_DENY_LIST_URL);
    if (fetchedData && fetchedData.denyList) {
      setHdfcDepositorDenyList(fetchedData.denyList);

      localStorage.setItem('hdfcDepositorDenyList', JSON.stringify({
        data: fetchedData.denyList,
        timestamp: now.getTime()
      }));

      return fetchedData.denyList;
    }
    return null;
  }, [fetchData]);

  const fetchGarantiDepositoryDenyList = useCallback(async () => {
    const GARANTI_DENY_LIST_URL = process.env.GARANTI_DENY_LIST_URL;
    if (!GARANTI_DENY_LIST_URL) {
      throw new Error(" GARANTI_DENY_LIST_URL environment variable is not defined.");
    }

    const cachedData = localStorage.getItem('garantiDepositorDenyList');
    const now = new Date();

    if (cachedData) {
      const { data: storedData, timestamp } = JSON.parse(cachedData);

      if (now.getTime() - timestamp < 60000) { // 1 min
        setGarantiDepositorDenyList(storedData);

        return storedData;
      }
    }

    const fetchedData = await fetchData(GARANTI_DENY_LIST_URL);
    if (fetchedData && fetchedData.denyList) {
      setGarantiDepositorDenyList(fetchedData.denyList);

      localStorage.setItem('garantiDepositorDenyList', JSON.stringify({
        data: fetchedData.denyList,
        timestamp: now.getTime()
      }));

      return fetchedData.denyList;
    }
    return null;
  }, [fetchData]);

  return (
    <DenyListContext.Provider value={{
      hdfcDepositorDenyList,
      fetchHdfcDepositoryDenyList,
      garantiDepositorDenyList,
      fetchGarantiDepositoryDenyList
    }}>
      {children}
    </DenyListContext.Provider>
  );
};

export default DenyListProvider;
