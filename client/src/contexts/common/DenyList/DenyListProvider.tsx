import React, { useEffect, useState, ReactNode } from 'react';

import { esl } from '@helpers/constants';
import useGithubClient from '@hooks/useGithubClient';


import DenyListContext from './DenyListContext';

interface ProvidersProps {
  children: ReactNode;
}

const DenyListProvider = ({ children }: ProvidersProps) => {
  /*
   * Context
   */

  const { 
    data,
    fetchData
  } = useGithubClient();

  /*
   * State
   */

  const [hdfcDepositorDenyList, setHdfcDepositorDenyList] = useState<string[] | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('denyList_1');
    esl && console.log('checking data: ', data);

    if (data) {
      esl && console.log('denyList_2');

      setHdfcDepositorDenyList(data.hdfcDenyList);
    } else {
      esl && console.log('denyList_3');

      setHdfcDepositorDenyList(null);
    }
  }, [data]);

  return (
    <DenyListContext.Provider
      value={{
        hdfcDepositorDenyList,
        fetchHdfcDepositoryDenyList: fetchData
      }}
    >
      {children}
    </DenyListContext.Provider>
  );
};

export default DenyListProvider;
