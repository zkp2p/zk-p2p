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

  const [venmoDepositorDenyList, setVenmoDepositorDenyList] = useState<string[] | null>(null);
  const [hdfcDepositorDenyList, setHdfcDepositorDenyList] = useState<string[] | null>(null);
  const [garantiDepositorDenyList, setGarantiDepositorDenyList] = useState<string[] | null>(null);

  const fetchDenyList = useCallback(async (url: string, storageKey: string, setter: any) => {
    const cachedData = localStorage.getItem(storageKey);
    const now = new Date();

    if (cachedData) {
      const { data: storedData, timestamp } = JSON.parse(cachedData);

      if (now.getTime() - timestamp < 60000) { // 1 min
        setter(storedData);

        return storedData;
      }
    }

    const fetchedData = await fetchData(url);
    if (fetchedData && fetchedData.denyList) {
      setter(fetchedData.denyList);

      localStorage.setItem(storageKey, JSON.stringify({
        data: fetchedData.denyList,
        timestamp: now.getTime()
      }));

      return fetchedData.denyList;
    }
    return null;
  }, [fetchData]);

  const fetchHdfcDepositoryDenyList = useCallback(async () => {
    const HDFC_DENY_LIST_URL = process.env.HDFC_DENY_LIST_URL;
    if (!HDFC_DENY_LIST_URL) {
      throw new Error("HDFC_DENY_LIST_URL environment variable is not defined.");
    }

    const denyList = await fetchDenyList(HDFC_DENY_LIST_URL, 'hdfcDepositorDenyList', setHdfcDepositorDenyList);

    return denyList;
  }, [fetchDenyList]);

  const fetchGarantiDepositoryDenyList = useCallback(async () => {
    const GARANTI_DENY_LIST_URL = process.env.GARANTI_DENY_LIST_URL;
    if (!GARANTI_DENY_LIST_URL) {
      throw new Error("GARANTI_DENY_LIST_URL environment variable is not defined.");
    }

    const denyList = await fetchDenyList(GARANTI_DENY_LIST_URL, 'garantiDepositorDenyList', setGarantiDepositorDenyList);
    
    return denyList;
  }, [fetchDenyList]);

  const fetchVenmoDepositorDenyList = useCallback(async () => {
    const VENMO_DENY_LIST_URL = process.env.VENMO_DENY_LIST_URL;
    if (!VENMO_DENY_LIST_URL) {
      throw new Error("VENMO_DENY_LIST_URL environment variable is not defined.");
    }

    const denyList = await fetchDenyList(VENMO_DENY_LIST_URL, 'venmoDepositorDenyList', setVenmoDepositorDenyList);

    return denyList;
  }, [fetchDenyList]);

  return (
    <DenyListContext.Provider value={{
      venmoDepositorDenyList,
      fetchVenmoDepositorDenyList,
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
