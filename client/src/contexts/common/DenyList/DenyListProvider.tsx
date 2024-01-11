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

  const {  fetchData } = useGithubClient();

  /*
   * State
   */

  const [hdfcDepositorDenyList, setHdfcDepositorDenyList] = useState<string[] | null>(null);

  const fetchHdfcDepositoryDenyList = useCallback(async () => {
    const cachedData = localStorage.getItem('hdfcDepositorDenyList');
    const now = new Date();

    if (cachedData) {
      const { data: storedData, timestamp } = JSON.parse(cachedData);

      if (now.getTime() - timestamp < 60000) { // 1 min
        setHdfcDepositorDenyList(storedData);

        return storedData;
      }
    }

    const fetchedData = await fetchData();
    if (fetchedData && fetchedData.hdfcDenyList) {
      setHdfcDepositorDenyList(fetchedData.hdfcDenyList);

      localStorage.setItem('hdfcDepositorDenyList', JSON.stringify({
        data: fetchedData.hdfcDenyList,
        timestamp: now.getTime()
      }));

      return fetchedData.hdfcDenyList;
    }
    return null;
  }, [fetchData]);

  return (
    <DenyListContext.Provider value={{ hdfcDepositorDenyList, fetchHdfcDepositoryDenyList }}>
      {children}
    </DenyListContext.Provider>
  );
};

export default DenyListProvider;
