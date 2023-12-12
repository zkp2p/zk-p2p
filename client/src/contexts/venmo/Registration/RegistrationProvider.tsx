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

  // getAccountInfo(address _account) external view returns (bytes32)
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
    esl && console.log('venmo_shouldFetchRegistration_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking rampAddress: ', rampAddress);
    
    if (isLoggedIn && loggedInEthereumAddress && rampAddress) {
      esl && console.log('venmo_shouldFetchRegistration_2');

      setShouldFetchRegistration(true);
    } else {
      esl && console.log('venmo_shouldFetchRegistration_3');
      
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
    esl && console.log('venmo_rampAccountRaw_1');
    esl && console.log('checking rampAccountRaw: ', rampAccountRaw);
  
    if (rampAccountRaw) {
      esl && console.log('venmo_rampAccountRaw_2');

      const rampAccountData = rampAccountRaw as any;
      const rampAccountProcessed = rampAccountData.venmoIdHash;
      
      if (rampAccountProcessed !== ZERO_ADDRESS) {
        esl && console.log('venmo_rampAccountRaw_3');

        setRegistrationHash(rampAccountProcessed);

        setShouldFetchVenmoNftId(true); 
      } else {
        esl && console.log('venmo_rampAccountRaw_4');

        setRegistrationHash(null);

        setShouldFetchVenmoNftId(false);
      }
    } else {
      esl && console.log('venmo_rampAccountRaw_5');
      
      setRegistrationHash(null);

      setShouldFetchVenmoNftId(false);
    }
  }, [rampAccountRaw]);

  useEffect(() => {
    esl && console.log('venmo_extractedVenmoIdStorageKey_1');
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (loggedInEthereumAddress) {
      esl && console.log('venmo_extractedVenmoIdStorageKey_2');

      setExtractedVenmoIdStorageKey(`extractedVenmoId_${loggedInEthereumAddress}`);
    } else {
      esl && console.log('venmo_extractedVenmoIdStorageKey_3');

      setExtractedVenmoIdStorageKey(null);
    }
  }, [loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('venmo_extractedVenmoId_1');
    esl && console.log('checking extractedVenmoIdStorageKey: ', extractedVenmoIdStorageKey);

    if (extractedVenmoIdStorageKey) {
      esl && console.log('venmo_extractedVenmoId_2');

      const storedValue = localStorage.getItem(extractedVenmoIdStorageKey);
      if (storedValue !== null) {
        _setExtractedVenmoId(storedValue);
      } else {
        _setExtractedVenmoId(null);
      }
    } else {
      esl && console.log('venmo_extractedVenmoId_3');

      _setExtractedVenmoId(null);
    }
  }, [extractedVenmoIdStorageKey]);

  useEffect(() => {
    esl && console.log('venmo_venmoNftIdRaw_1');
    esl && console.log('checking venmoNftIdRaw: ', venmoNftIdRaw);
  
    if (venmoNftIdRaw) { // we want ZERO to be falsy
      esl && console.log('venmo_venmoNftIdRaw_2');

      const venmoNftIdProcessed = (venmoNftIdRaw as bigint);
      
      setVenmoNftId(venmoNftIdProcessed);

      setShouldFetchVenmoNftUri(true);
    } else {
      esl && console.log('venmo_venmoNftIdRaw_3');
      
      setVenmoNftId(null);

      setShouldFetchVenmoNftUri(false);
    }
  }, [venmoNftIdRaw]);

  useEffect(() => {
    esl && console.log('venmo_venmoNftUriRaw_1');
    esl && console.log('checking venmoNftUriRaw: ', venmoNftUriRaw);
  
    if (venmoNftUriRaw) {
      esl && console.log('venmo_venmoNftUriRaw_2');

      const venmoNftUriProcessed = (venmoNftUriRaw as string);
      const svgString = extractSvg(venmoNftUriProcessed);
      
      setVenmoNftUri(svgString);
    } else {
      esl && console.log('venmo_venmoNftUriRaw_3');
      
      setVenmoNftUri(null);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venmoNftUriRaw]);

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
  }

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
        venmoNftId,
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
