import { forwardRef, useEffect, useState } from 'react';
import { User, Copy, ArrowDownCircle, ArrowUpCircle, Repeat, LogOut } from 'react-feather';
import styled from "styled-components";
import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect, usePrepareSendTransaction, useSendTransaction, useContractRead, erc20ABI, useWaitForTransaction, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useEcdsaProvider } from '@zerodev/wagmi';
import Link from '@mui/material/Link';
import { ENSName } from 'react-ens-name';
import { esl, ZERO, ZERO_ADDRESS } from '@helpers/constants'

import { Overlay } from '@components/modals/Overlay';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useLifiBridge from '@hooks/useLifiBridge';
import useSocketBridge from '@hooks/useSocketBridge';
import useSmartContracts from "@hooks/useSmartContracts";
import useModal from '@hooks/useModal';
import { toUsdcString, toEthString } from "@helpers/units";
import { formatAddress } from '@helpers/addressFormat';
import { MODALS } from '@helpers/types';
import { alchemyMainnetEthersProvider } from "index";
import { Button } from '@mui/material';


interface AccountDropdownProps {
  onOptionSelect: () => void;
}

export const AccountDropdown = forwardRef<HTMLDivElement, AccountDropdownProps>(({ onOptionSelect }, ref) => {
  /*
   * Contexts
   */

  const { authenticated, logout, user } = usePrivy();
  const { disconnect } = useDisconnect();
  const { usdcBalance, ethBalance } = useBalances();
  const { loggedInEthereumAddress } = useAccount();
  const { blockscanUrl } = useSmartContracts();
  const { openModal } = useModal();

  const {
    quoteData: lifiQuoteResponse,
    statusData: lifiStatusResponse,
    loading: isLifiQuoteLoading,
    error: lifiQuoteError,
    fetchQuote: fetchLifiQuote,
    fetchTransactionStatus: fetchLifiTransactionStatus,
  } = useLifiBridge();


  /*
   * State
   */
  const [usdcApprovalToBridge, setUsdcApprovalToBridge] = useState<bigint | null>(null);
  const [shouldFetchUsdcApprovalToBridge, setShouldFetchUsdcApprovalToBridge] = useState<boolean>(false);
  const [shouldConfigureBridgeWrite, setShouldConfigureBridgeWrite] = useState<boolean>(false);
  const [shouldConfigureApprovalWrite, setShouldConfigureApprovalWrite] = useState<boolean>(false);


  /*
   * Contract Reads
   */
  
  const {
    data: usdcApprovalToBridgeRaw,
    refetch: refetchUsdcApprovalToBridge,
  } = useContractRead({
    address: usdcAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      loggedInEthereumAddress ?? ZERO_ADDRESS,
      lifiQuoteResponse?.estimate.approvalAddress ?? ZERO_ADDRESS
    ],
    enabled: shouldFetchUsdcApprovalToBridge,
  });

  /*
   * Contract Writes
   */
  const { config: writeApproveConfig } = usePrepareContractWrite({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "approve",
    args: [
      lifiQuoteResponse?.estimate.approvalAddress ?? ZERO_ADDRESS,
      lifiQuoteResponse?.estimate.fromAmount ?? ZERO
    ],
    enabled: shouldConfigureApprovalWrite
  });

  const {
    data: submitApproveResult,
    status: signApproveTransactionStatus,
    writeAsync: writeSubmitApproveAsync
  } = useContractWrite(writeApproveConfig);

  const {
    status: mineApproveTransactionStatus
  } = useWaitForTransaction({
    hash: submitApproveResult ? submitApproveResult.hash : undefined,
    onSuccess(data: any) {
      console.log('writeSubmitApproveAsync successful: ', data);
      
      refetchUsdcApprovalToBridge?.();

      refetchUsdcBalance?.();
    },
  });

  const {
    config: writeSubmitBridgeConfig
  } = usePrepareSendTransaction({
    to: lifiQuoteResponse?.transactionRequest.to,
    value: lifiQuoteResponse?.transactionRequest.value,
    data: lifiQuoteResponse?.transactionRequest.data,
    onError: (error: { message: any }) => {
      console.error(error.message);
    },
    enabled: shouldConfigureBridgeWrite
  });

  const {
    data: submitBridgeResult,
    status: submitBridgeStatus,
    sendTransaction: writeSubmitBridgeAsync
  } = useSendTransaction(writeSubmitBridgeConfig);

  const {
    isLoading: isSubmitBridgeMining,
    isSuccess: isSubmitBridgeSuccessful
  } = useWaitForTransaction({
    hash: submitBridgeResult ? submitBridgeResult.hash : undefined,
    async onSuccess(data: any) {
      console.log('writeSubmitBridgeAsync successful: ', data);

      await fetchLifiTransactionStatus(data.transactionHash);

      // Log status
      console.log('lifiStatusResponse', lifiStatusResponse);
      
      refetchUsdcApprovalToBridge?.();

      refetchUsdcBalance?.();
    },
  });
  
  /*
   * Effects
   */
  useEffect(() => {
    console.log("usdcApprovalToBridge", usdcApprovalToBridge)
    const isApprovalRequired = usdcApprovalToBridge as any < lifiQuoteResponse?.estimate.fromAmount;
    setShouldConfigureApprovalWrite(isApprovalRequired);
    setShouldConfigureBridgeWrite(!isApprovalRequired);
  }, [usdcApprovalToBridge]);

  
  useEffect(() => {
    esl && console.log('usdcApprovalToBridgeRaw_1');
    esl && console.log('checking usdcApprovalToBridgeRaw: ', usdcApprovalToBridgeRaw);
  
    if (usdcApprovalToBridgeRaw || usdcApprovalToBridgeRaw === ZERO) { // BigInt(0) is falsy
      esl && console.log('usdcApprovalToBridgeRaw_2');

      setUsdcApprovalToBridge(usdcApprovalToBridgeRaw);
    } else {
      esl && console.log('usdcApprovalToBridgeRaw_3');
      
      setUsdcApprovalToBridge(null);
    }
  }, [usdcApprovalToBridgeRaw]);

  useEffect(() => {
    esl && console.log('shouldFetchUsdcBalanceAndApproval_1');
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking bridgeAddress: ', lifiQuoteResponse?.estimate.approvalAddress);
    esl && console.log('checking usdcAddress: ', usdcAddress);

    if (isLoggedIn && loggedInEthereumAddress && lifiQuoteResponse?.estimate.approvalAddress && usdcAddress) {
      esl && console.log('shouldFetchUsdcBalanceAndApproval_2');

      setShouldFetchUsdcApprovalToBridge(true);
    } else {
      esl && console.log('shouldFetchUsdcBalanceAndApproval_3');

      setShouldFetchUsdcApprovalToBridge(false);

      setUsdcApprovalToBridge(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, lifiQuoteResponse, usdcAddress]);

  /*
   * Handler
   */

  const handleDepositClick = () => {
    openModal(MODALS.DEPOSIT);

    onOptionSelect();
  };

  const handleWithdrawClick = () => {
    openModal(MODALS.WITHDRAW);

    onOptionSelect();
  };

  const handleLogout = async () => {
    if (authenticated) {
      await logout();
    }

    await disconnect();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  };

  const handleCopyClick = () => {
    if (loggedInEthereumAddress) {
      copyToClipboard(loggedInEthereumAddress);
    }
  };

  const handleFetchQuote = async () => {
    await fetchLifiQuote({
      "fromChain": 'bas',
      "toChain": 'pol', // hardcode polygon
      "fromToken": '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      "toToken": '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // hardcode USDT
      "fromAmount": '10000000', // hardcoded amount
      "fromAddress": loggedInEthereumAddress as string,
      "toAddress": loggedInEthereumAddress as string, // hardcoded to address
    });

    console.log("returned Lifi quote", lifiQuoteResponse);
  };
  
  const handleApproveUsdc = async () => {  
    if (shouldConfigureApprovalWrite && writeSubmitApproveAsync) {
      try {
        await writeSubmitApproveAsync();
      } catch (error) {
        console.log('writeSubmitBridgeAsync failed: ', error);

        setShouldConfigureApprovalWrite(false);
      }
    }
  };
  
  const handleBridge = async () => {  
    console.log(shouldConfigureBridgeWrite, writeSubmitBridgeAsync)
    if (shouldConfigureBridgeWrite && writeSubmitBridgeAsync) {
      try {
        await writeSubmitBridgeAsync();
      } catch (error) {
        console.log('writeSubmitBridgeAsync failed: ', error);

        setShouldConfigureBridgeWrite(false);
      }
    }

    // // Send a batched userop with the ECDSAProvider
    // const txn = await ecdsaProvider?.sendUserOperation([
    //   {
    //     target: "targetAddress1",
    //     data: "callData1",
    //     value: value1,
    //   },
    //   {
    //     target: "targetAddress2",
    //     data: "callData2",
    //     value: value2,
    //   },
    // ])
  };

  /*
   * Helpers
   */

  const depositorEtherscanLink = `${blockscanUrl}/address/${loggedInEthereumAddress}`;

  /*
   * Component
   */

  return (
    <Wrapper>
      <Overlay />

      <NavDropdown ref={ref}>
        <AccountAndUserIconContainer>
          <IconBorder>
            <StyledUser />
          </IconBorder>
          <AccountTypeLabel>
            {user ? user.email.address : 'Connected'}
          </AccountTypeLabel>
          <AccountAddressAndENSContainer>
            <AccountAddress>
              <Link href={depositorEtherscanLink} target="_blank">
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={loggedInEthereumAddress || ''}
                  customDisplay={(address) => formatAddress(address)}
                />
              </Link>
            </AccountAddress>
            <StyledCopy onClick={handleCopyClick} />
          </AccountAddressAndENSContainer>
        </AccountAndUserIconContainer>

        <BalancesContainer>
          <BalanceValue>
            {usdcBalance ? toUsdcString(usdcBalance, true) : "0"}
          </BalanceValue>

          <BalanceLabel>
            {`USDC`}
          </BalanceLabel>
        </BalancesContainer>
        
        <NavDropdownItemsContainer>
          <ItemAndIconContainer onClick={handleDepositClick}>
            <StyledArrowUpCircle />

            <NavDropdownItem>
              Deposit
            </NavDropdownItem>
          </ItemAndIconContainer>
          
          <ItemAndIconContainer onClick={handleWithdrawClick}>
            <StyledArrowDownCircle />

            <NavDropdownItem>
              Withdraw
            </NavDropdownItem>
          </ItemAndIconContainer>

          <ItemAndIconContainer>
            <StyledRepeat />
            <BridgeLinkAndBalance>
              <BridgeLink
                href="https://bridge.base.org/deposit"
                target="_blank"
              >
                Bridge ↗
              </BridgeLink>
              {!user && (
                <EthBalance>
                  {ethBalance ? `${toEthString(ethBalance)} ETH` : 'Fetching ETH balance...'}
                </EthBalance>
              )}
            </BridgeLinkAndBalance>
          </ItemAndIconContainer>

          <ItemAndIconContainer>
            <StyledLogOut />
            <LogoutContainer onClick={handleLogout}>
              Logout
            </LogoutContainer>
          </ItemAndIconContainer>
        </NavDropdownItemsContainer>
      </NavDropdown>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: flex-start;
`;

const NavDropdown = styled.div`
  display: flex;
  min-width: 300px;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: #1B1B1B;
  position: absolute;
  top: calc(100% + 20px);
  right: 0;
  z-index: 20;
  color: #FFFFFF;
`;

const AccountAndUserIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  white-space: nowrap;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #98a1c03d;
`;

const AccountTypeLabel = styled.div`
  font-weight: 700;
`;

const AccountAddressAndENSContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;

const AccountAddress = styled.div`
`;

const StyledUser = styled(User)`
  color: #FFF;
  background-color: #C5C5C5;
  height: 24px;
  width: 24px;
`;

const StyledCopy = styled(Copy)`
  color: #FFF;
  height: 16px;
  width: 16px;
  cursor: pointer;
`;

const StyledArrowUpCircle = styled(ArrowUpCircle)`
  color: #FFF;
  height: 20px;
  width: 20px;
`;

const StyledArrowDownCircle = styled(ArrowDownCircle)`
  color: #FFF;
  height: 20px;
  width: 20px;
`;

const StyledRepeat = styled(Repeat)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const StyledLogOut = styled(LogOut)`
  color: #E96069;
  height: 20px;
  width: 20px;
`;

const IconBorder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #C5C5C5;
  padding: 10px;
  border-radius: 50%;
  border: 1px solid #C5C5C5;
`;

const BalancesContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  gap: 12px;

  font-family: 'Graphik';
  border-bottom: 1px solid #98a1c03d;
`;

const BalanceValue = styled.div`
  color: #FFFFFF;
  font-size: 28px;
  font-weight: 700;
`;

const BalanceLabel = styled.div`
  color: #9ca3af;  
  font-size: 20px;
`;

const NavDropdownItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  padding: 8px 0px;
`;

const LogoutContainer = styled.div`
  cursor: pointer;
  text-decoration: none;
  color: #E96069;
  padding-top: 2px;
`;

const ItemAndIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-direction: flex-start;
  padding: 16px 24px;

  &:hover {
    color: #6C757D;
    box-shadow: none;

    ${StyledArrowUpCircle}, ${StyledArrowDownCircle}, ${StyledRepeat} {
      color: #6C757D;
    }

    ${StyledLogOut} {
      color: #CA2221;
    }

    ${LogoutContainer} {
      color: #CA2221;
    }
  }
`;

const NavDropdownItem = styled.div`
  color: inherit;
  text-decoration: none;
  padding-top: 2px;
`;

const BridgeLinkAndBalance = styled.div`
  display: flex;  
  flex-direction: row;
  justify-content: space-between;
  flex-grow: 1;
`;

const BridgeLink = styled.a`
  color: inherit;
  text-decoration: none;
  background-color: #1B1B1B;
`;

const EthBalance = styled.a`
  color: #9ca3af;
  font-size: 16px;
  font-weight: 500;
  padding-top: 2px;
`;
