import React, { useCallback, useEffect, useState, ReactNode } from 'react'
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

  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { rampAddress, rampAbi, venmoNftAddress, venmoNftAbi } = useSmartContracts()

  /*
   * State
   */

  const [registrationHash, setRegistrationHash] = useState<string | null>(null);

  const [extractedVenmoIdStorageKey, setExtractedVenmoIdStorageKey] = useState<string | null>(null);
  const [extractedVenmoId, _setExtractedVenmoId] = useState<string | null>(() => {
    if (extractedVenmoIdStorageKey) {
      return localStorage.getItem(extractedVenmoIdStorageKey) || null;
    }
    return null;
  });

  const [venmoNftId, setVenmoNftId] = useState<bigint | null>(null);
  const [venmoNftUri, setVenmoNftUri] = useState<string | null>(null);

  const [shouldFetchRegistration, setShouldFetchRegistration] = useState<boolean>(false);
  const [shouldFetchVenmoNftId, setShouldFetchVenmoNftId] = useState<boolean>(false);
  const [shouldFetchVenmoNftUri, setShouldFetchVenmoNftUri] = useState<boolean>(false);

  /*
   * Overridden Setters
   */

  const setExtractedVenmoId = useCallback((value: string | null) => {
    if (extractedVenmoIdStorageKey) {
      localStorage.setItem(extractedVenmoIdStorageKey, value || '');
      _setExtractedVenmoId(value);
    }
  }, [extractedVenmoIdStorageKey]);

  /*
   * Helpers
   */

  // The !! operator will convert any truthy value to true and any falsy value to false.
  const isRegistered = !!(registrationHash && registrationHash !== ZERO_ADDRESS);

  /*
   * Contract Reads (migrate to: https://wagmi.sh/react/hooks/useContractReads)
   */

  // getAccountVenmoId(address _account) external view returns (bytes32)
  const {
    data: rampAccountRaw,
    refetch: refetchRampAccount,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getAccountInfo',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchRegistration,
  })

  // getTokenId(address owner) public view returns (uint256)
  const {
    data: venmoNftIdRaw,
    refetch: refetchVenmoNftId,
  } = useContractRead({
    address: venmoNftAddress,
    abi: venmoNftAbi,
    functionName: 'getTokenId',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchVenmoNftId,
  })

  // tokenURI(uint256 tokenId) public view override returns (string memory)
  const {
    data: venmoNftUriRaw,
    // refetch: refetchVenmoNftUri,
  } = useContractRead({
    address: venmoNftAddress,
    abi: venmoNftAbi,
    functionName: 'tokenURI',
    args: [
      venmoNftId
    ],
    enabled: shouldFetchVenmoNftUri,
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('shouldFetchRegistration_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking rampAddress: ', rampAddress);
    
    if (isLoggedIn && loggedInEthereumAddress && rampAddress) {
      esl && console.log('shouldFetchRegistration_2');

      setShouldFetchRegistration(true);
    } else {
      esl && console.log('shouldFetchRegistration_3');
      
      setShouldFetchRegistration(false);
      setShouldFetchVenmoNftId(false);
      setShouldFetchVenmoNftUri(false);

      setRegistrationHash(null);
      setExtractedVenmoId(null);
      setVenmoNftUri(null);
      setVenmoNftId(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, rampAddress, setExtractedVenmoId]);

  useEffect(() => {
    esl && console.log('rampAccountRaw_1');
    esl && console.log('checking rampAccountRaw: ', rampAccountRaw);
  
    if (rampAccountRaw) {
      esl && console.log('rampAccountRaw_2');

      const rampAccountData = rampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.venmoIdHash;
      
      setRegistrationHash(rampAccountProcessed);

      setShouldFetchVenmoNftId(true);
    } else {
      esl && console.log('rampAccountRaw_3');
      
      setRegistrationHash(null);

      setShouldFetchVenmoNftId(false);
    }
  }, [rampAccountRaw]);

  useEffect(() => {
    esl && console.log('extractedVenmoIdStorageKey_1');
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (loggedInEthereumAddress) {
      esl && console.log('extractedVenmoIdStorageKey_2');

      setExtractedVenmoIdStorageKey(`extractedVenmoId_${loggedInEthereumAddress}`);
    } else {
      esl && console.log('extractedVenmoIdStorageKey_3');

      setExtractedVenmoIdStorageKey(null);
    }
  }, [loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('extractedVenmoId_1');
    esl && console.log('checking extractedVenmoIdStorageKey: ', extractedVenmoIdStorageKey);

    if (extractedVenmoIdStorageKey) {
      esl && console.log('extractedVenmoId_2');

      const storedValue = localStorage.getItem(extractedVenmoIdStorageKey);
      if (storedValue !== null) {
        _setExtractedVenmoId(storedValue);
      } else {
        _setExtractedVenmoId(null);
      }
    } else {
      esl && console.log('extractedVenmoId_3');

      _setExtractedVenmoId(null);
    }
  }, [extractedVenmoIdStorageKey]);

  useEffect(() => {
    esl && console.log('venmoNftIdRaw_1');
    esl && console.log('checking venmoNftIdRaw: ', venmoNftIdRaw);
  
    if (venmoNftIdRaw) { // we want ZERO to be falsy
      esl && console.log('venmoNftIdRaw_2');

      const venmoNftIdProcessed = (venmoNftIdRaw as bigint);
      
      setVenmoNftId(venmoNftIdProcessed);

      setShouldFetchVenmoNftUri(true);
    } else {
      esl && console.log('venmoNftIdRaw_3');
      
      setVenmoNftId(null);

      setShouldFetchVenmoNftUri(false);
    }
  }, [venmoNftIdRaw]);

  useEffect(() => {
    esl && console.log('venmoNftUriRaw_1');
    esl && console.log('checking venmoNftUriRaw: ', venmoNftUriRaw);
  
    if (venmoNftUriRaw) {
      esl && console.log('venmoNftUriRaw_2');

      const venmoNftUriProcessed = (venmoNftUriRaw as string);
      const svgString = extractSvg(venmoNftUriProcessed);
      
      setVenmoNftUri(svgString);
    } else {
      esl && console.log('venmoNftUriRaw_3');
      
      setVenmoNftUri(null);
    }
  }, [venmoNftUriRaw]);

  /*
   * Helpers
   */

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

    const svgString = atob(svgBase64String);
    return svgString;
  }

  /*
   * Provider
   */

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        registrationHash,
        extractedVenmoId,
        shouldFetchVenmoNftId,
        venmoNftUri,
        refetchVenmoNftId,
        setExtractedVenmoId,
        refetchRampAccount,
        shouldFetchRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider
