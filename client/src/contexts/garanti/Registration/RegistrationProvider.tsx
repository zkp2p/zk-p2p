import React, { useEffect, useCallback, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { esl, ZERO_ADDRESS } from '@helpers/constants'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts';

import RegistrationContext from './RegistrationContext'


interface ProvidersProps {
  children: ReactNode;
}

const RegistrationProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { garantiRampAddress, garantiRampAbi, garantiNftAddress, nftAbi } = useSmartContracts();

  /*
   * State
   */

  const [registrationHash, setRegistrationHash] = useState<string | null>(null);

  const [storedGarantiStorageKey, setStoredGarantiIdStorageKey] = useState<string | null>(null);
  const [storedGarantiId, _setStoredGarantiId] = useState<string | null>(() => {
    if (storedGarantiStorageKey) {
      return localStorage.getItem(storedGarantiStorageKey) || null;
    }
    return null;
  });

  const [garantiNftId, setGarantiNftId] = useState<bigint | null>(null);
  const [garantiNftUri, setGarantiNftUri] = useState<string | null>(null);

  const [shouldFetchGarantiRegistration, setShouldFetchGarantiRegistration] = useState<boolean>(false);
  const [shouldFetchGarantiNftId, setShouldFetchGarantiNftId] = useState<boolean>(false);
  const [shouldFetchGarantiNftUri, setShouldFetchGarantiNftUri] = useState<boolean>(false);

  /*
   * Overridden Setters
   */

  const setStoredGarantiId = useCallback((value: string | null) => {
    if (storedGarantiStorageKey) {
      localStorage.setItem(storedGarantiStorageKey, value || '');
      _setStoredGarantiId(value);
    }
  }, [storedGarantiStorageKey]);

  /*
   * Helpers
   */

  // The !! operator will convert any truthy value to true and any falsy value to false.
  const isRegistered = !!(registrationHash && registrationHash !== ZERO_ADDRESS);

  /*
   * Contract Reads
   */

  // getAccountInfo(address _account) external view returns (bytes32)
  const {
    data: garantiRampAccountRaw,
    refetch: refetchGarantiRampAccount,
  } = useContractRead({
    address: garantiRampAddress,
    abi: garantiRampAbi,
    functionName: 'getAccountInfo',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchGarantiRegistration,
  });

  // getTokenId(address owner) public view returns (uint256)
  const {
    data: garantiNftIdRaw,
    refetch: refetchGarantiNftId,
  } = useContractRead({
    address: garantiNftAddress,
    abi: nftAbi,
    functionName: 'getTokenId',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchGarantiNftId,
  });

  // tokenURI(uint256 tokenId) public view override returns (string memory)
  const {
    data: garantiNftUriRaw,
  } = useContractRead({
    address: garantiNftAddress,
    abi: nftAbi,
    functionName: 'tokenURI',
    args: [
      garantiNftId
    ],
    enabled: shouldFetchGarantiNftUri,
  });

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('garanti_shouldFetchGarantiRegistration_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking garantiRampAddress: ', garantiRampAddress);
    
    if (isLoggedIn && loggedInEthereumAddress && garantiRampAddress) {
      esl && console.log('garanti_shouldFetchGarantiRegistration_2');

      setShouldFetchGarantiRegistration(true);
    } else {
      esl && console.log('garanti_shouldFetchGarantiRegistration_3');
      
      setShouldFetchGarantiRegistration(false);
      setShouldFetchGarantiNftId(false);
      setShouldFetchGarantiNftUri(false);

      setRegistrationHash(null);
      setStoredGarantiId(null);
      setGarantiNftId(null);
      setGarantiNftUri(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, garantiRampAddress, setStoredGarantiId]);

  useEffect(() => {
    esl && console.log('garanti_garantiRampAccountRaw_1');
    esl && console.log('checking garantiRampAccountRaw: ', garantiRampAccountRaw);
  
    if (garantiRampAccountRaw) {
      esl && console.log('garanti_garantiRampAccountRaw_2');

      const rampAccountData = garantiRampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.idHash;

      if (rampAccountProcessed !== ZERO_ADDRESS) {
        esl && console.log('garanti_rampAccountRaw_3');

        setRegistrationHash(rampAccountProcessed);

        setShouldFetchGarantiNftId(true);
      } else {
        esl && console.log('garanti_rampAccountRaw_4');

        setRegistrationHash(null);

        setShouldFetchGarantiNftId(false);
      }
    } else {
      esl && console.log('garanti_garantiRampAccountRaw_5');
      
      setRegistrationHash(null);

      setShouldFetchGarantiNftId(false);
    }
  }, [garantiRampAccountRaw]);

  useEffect(() => {
    esl && console.log('garanti_storedGarantiStorageKey_1');
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (loggedInEthereumAddress) {
      esl && console.log('garanti_storedGarantiStorageKey_2');

      setStoredGarantiIdStorageKey(`StoredGarantiId_${loggedInEthereumAddress}`);
    } else {
      esl && console.log('garanti_storedGarantiStorageKey_3');

      setStoredGarantiIdStorageKey(null);
    }
  }, [loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('garanti_StoredGarantiId_1');
    esl && console.log('checking storedGarantiStorageKey: ', storedGarantiStorageKey);

    if (storedGarantiStorageKey) {
      esl && console.log('garanti_StoredGarantiId_2');

      const storedValue = localStorage.getItem(storedGarantiStorageKey);
      if (storedValue !== null) {
        _setStoredGarantiId(storedValue);
      } else {
        _setStoredGarantiId(null);
      }
    } else {
      esl && console.log('garanti_StoredGarantiId_3');

      _setStoredGarantiId(null);
    }
  }, [storedGarantiStorageKey]);

  useEffect(() => {
    esl && console.log('garanti_garantiNftIdRaw_1');
    esl && console.log('checking garantiNftIdRaw: ', garantiNftIdRaw);
  
    if (garantiNftIdRaw) { // we want ZERO to be falsy
      esl && console.log('garanti_garantiNftIdRaw_2');

      const garantiNftIdProcessed = (garantiNftIdRaw as bigint);
      
      setGarantiNftId(garantiNftIdProcessed);

      setShouldFetchGarantiNftUri(true);
    } else {
      esl && console.log('garanti_garantiNftIdRaw_3');
      
      setGarantiNftId(null);

      setShouldFetchGarantiNftUri(false);
    }
  }, [garantiNftIdRaw]);

  useEffect(() => {
    esl && console.log('garanti_garantiNftUriRaw_1');
    esl && console.log('checking garantiNftUriRaw: ', garantiNftUriRaw);
  
    if (garantiNftUriRaw) {
      esl && console.log('garanti_garantiNftUriRaw_2');

      const garantiNftUriProcessed = (garantiNftUriRaw as string);
      const svgString = extractSvg(garantiNftUriProcessed);
      
      setGarantiNftUri(svgString);
    } else {
      esl && console.log('garanti_garantiNftUriRaw_3');
      
      setGarantiNftUri(null);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garantiNftUriRaw]);

  /*
   * Helpers
   */

  function decodeBase64Utf8(base64Str: string) {
    const binaryString = window.atob(base64Str);

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  };

  function extractSvg(jsonDataString: string): any {
    const uriPrefix = "data:application/json;base64,";

    let base64String = jsonDataString;
    if (jsonDataString.startsWith(uriPrefix)) {
      base64String = jsonDataString.substring(uriPrefix.length);
    }

    const decodedString = atob(base64String);
    const nftData = JSON.parse(decodedString);
    const svgData = nftData.image;

    const imagePrefix = "data:image/svg+xml;base64,";

    let svgBase64String = svgData;
    if (svgData.startsWith(imagePrefix)) {
      svgBase64String = svgData.substring(imagePrefix.length);
    }

    const svgString = decodeBase64Utf8(svgBase64String);

    return svgString;
  };

  /*
   * Provider
   */

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        storedGarantiId,
        shouldFetchGarantiNftId,
        garantiNftId,
        garantiNftUri,
        refetchGarantiNftId,
        setStoredGarantiId,
        refetchRampAccount: refetchGarantiRampAccount,
        shouldFetchRegistration: shouldFetchGarantiRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
