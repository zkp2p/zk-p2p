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
  const { hdfcRampAddress, hdfcRampAbi, hdfcNftAddress, nftAbi } = useSmartContracts();

  /*
   * State
   */

  const [registrationHash, setRegistrationHash] = useState<string | null>(null);

  const [storedUpiStorageKey, setStoredUpiIdStorageKey] = useState<string | null>(null);
  const [storedUpiId, _setStoredUpiId] = useState<string | null>(() => {
    if (storedUpiStorageKey) {
      return localStorage.getItem(storedUpiStorageKey) || null;
    }
    return null;
  });

  const [hdfcNftId, setHdfcNftId] = useState<bigint | null>(null);
  const [hdfcNftUri, setHdfcNftUri] = useState<string | null>(null);

  const [shouldFetchHdfcRegistration, setShouldFetchHdfcRegistration] = useState<boolean>(false);
  const [shouldFetchHdfcNftId, setShouldFetchHdfcNftId] = useState<boolean>(false);
  const [shouldFetchHdfcNftUri, setShouldFetchHdfcNftUri] = useState<boolean>(false);

  /*
   * Overridden Setters
   */

  const setStoredUpiId = useCallback((value: string | null) => {
    if (storedUpiStorageKey) {
      localStorage.setItem(storedUpiStorageKey, value || '');
      _setStoredUpiId(value);
    }
  }, [storedUpiStorageKey]);

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
    data: hdfcRampAccountRaw,
    refetch: refetchHdfcRampAccount,
  } = useContractRead({
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
    functionName: 'getAccountInfo',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchHdfcRegistration,
  });

  // getTokenId(address owner) public view returns (uint256)
  const {
    data: hdfcNftIdRaw,
    refetch: refetchHdfcNftId,
  } = useContractRead({
    address: hdfcNftAddress,
    abi: nftAbi,
    functionName: 'getTokenId',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchHdfcNftId,
  });

  // tokenURI(uint256 tokenId) public view override returns (string memory)
  const {
    data: hdfcNftUriRaw,
  } = useContractRead({
    address: hdfcNftAddress,
    abi: nftAbi,
    functionName: 'tokenURI',
    args: [
      hdfcNftId
    ],
    enabled: shouldFetchHdfcNftUri,
  });

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('hdfc_shouldFetchHdfcRegistration_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking hdfcRampAddress: ', hdfcRampAddress);
    
    if (isLoggedIn && loggedInEthereumAddress && hdfcRampAddress) {
      esl && console.log('hdfc_shouldFetchHdfcRegistration_2');

      setShouldFetchHdfcRegistration(true);
    } else {
      esl && console.log('hdfc_shouldFetchHdfcRegistration_3');
      
      setShouldFetchHdfcRegistration(false);
      setShouldFetchHdfcNftId(false);
      setShouldFetchHdfcNftUri(false);

      setRegistrationHash(null);
      setStoredUpiId(null);
      setHdfcNftId(null);
      setHdfcNftUri(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, hdfcRampAddress, setStoredUpiId]);

  useEffect(() => {
    esl && console.log('hdfc_hdfcRampAccountRaw_1');
    esl && console.log('checking hdfcRampAccountRaw: ', hdfcRampAccountRaw);
  
    if (hdfcRampAccountRaw) {
      esl && console.log('hdfc_hdfcRampAccountRaw_2');

      const rampAccountData = hdfcRampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.idHash;

      if (rampAccountProcessed !== ZERO_ADDRESS) {
        esl && console.log('hdfc_rampAccountRaw_3');

        setRegistrationHash(rampAccountProcessed);

        setShouldFetchHdfcNftId(true);
      } else {
        esl && console.log('hdfc_rampAccountRaw_4');

        setRegistrationHash(null);

        setShouldFetchHdfcNftId(false);
      }
    } else {
      esl && console.log('hdfc_hdfcRampAccountRaw_5');
      
      setRegistrationHash(null);

      setShouldFetchHdfcNftId(false);
    }
  }, [hdfcRampAccountRaw]);

  useEffect(() => {
    esl && console.log('hdfc_storedUpiStorageKey_1');
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (loggedInEthereumAddress) {
      esl && console.log('hdfc_storedUpiStorageKey_2');

      setStoredUpiIdStorageKey(`StoredUpiId_${loggedInEthereumAddress}`);
    } else {
      esl && console.log('hdfc_storedUpiStorageKey_3');

      setStoredUpiIdStorageKey(null);
    }
  }, [loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('hdfc_StoredUpiId_1');
    esl && console.log('checking storedUpiStorageKey: ', storedUpiStorageKey);

    if (storedUpiStorageKey) {
      esl && console.log('hdfc_StoredUpiId_2');

      const storedValue = localStorage.getItem(storedUpiStorageKey);
      if (storedValue !== null) {
        _setStoredUpiId(storedValue);
      } else {
        _setStoredUpiId(null);
      }
    } else {
      esl && console.log('hdfc_StoredUpiId_3');

      _setStoredUpiId(null);
    }
  }, [storedUpiStorageKey]);

  useEffect(() => {
    esl && console.log('hdfc_hdfcNftIdRaw_1');
    esl && console.log('checking hdfcNftIdRaw: ', hdfcNftIdRaw);
  
    if (hdfcNftIdRaw) { // we want ZERO to be falsy
      esl && console.log('hdfc_hdfcNftIdRaw_2');

      const hdfcNftIdProcessed = (hdfcNftIdRaw as bigint);
      
      setHdfcNftId(hdfcNftIdProcessed);

      setShouldFetchHdfcNftUri(true);
    } else {
      esl && console.log('hdfc_hdfcNftIdRaw_3');
      
      setHdfcNftId(null);

      setShouldFetchHdfcNftUri(false);
    }
  }, [hdfcNftIdRaw]);

  useEffect(() => {
    esl && console.log('hdfc_hdfcNftUriRaw_1');
    esl && console.log('checking hdfcNftUriRaw: ', hdfcNftUriRaw);
  
    if (hdfcNftUriRaw) {
      esl && console.log('hdfc_hdfcNftUriRaw_2');

      const hdfcNftUriProcessed = (hdfcNftUriRaw as string);
      const svgString = extractSvg(hdfcNftUriProcessed);
      
      setHdfcNftUri(svgString);
    } else {
      esl && console.log('hdfc_hdfcNftUriRaw_3');
      
      setHdfcNftUri(null);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hdfcNftUriRaw]);

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
        storedUpiId,
        shouldFetchHdfcNftId,
        hdfcNftId,
        hdfcNftUri,
        refetchHdfcNftId,
        setStoredUpiId,
        refetchRampAccount: refetchHdfcRampAccount,
        shouldFetchRegistration: shouldFetchHdfcRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
