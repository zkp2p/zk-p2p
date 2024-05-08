import React, { useEffect, forwardRef } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Repeat, LogOut, Key, UserCheck, Zap } from 'react-feather';
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { ENSName } from 'react-ens-name';

import { Overlay } from '@components/modals/Overlay';
import { EthereumAvatar } from "@components/Account/Avatar";
import { CopyButton } from "@components/common/CopyButton";
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from "@hooks/useSmartContracts";
import useModal from '@hooks/useModal';
import { formatAddress } from '@helpers/addressFormat';
import { CALLER_ACCOUNT } from '@helpers/constants';
import { toUsdcString, toEthString } from "@helpers/units";
import { colors } from '@theme/colors';
import { LoginStatus } from '@helpers/types';
import { MODALS } from '@helpers/types';
import { alchemyMainnetEthersProvider } from "index";

import usdcSvg from '../../assets/images/tokens/usdc.svg';


interface AccountDropdownProps {
  onOptionSelect: () => void;
}

export const AccountDropdown = forwardRef<HTMLDivElement, AccountDropdownProps>(({ onOptionSelect }, ref) => {
  const navigate = useNavigate();

  /*
   * Contexts
   */

  const {
    usdcBalance,
    ethBalance,
    refetchUsdcBalance,
    refetchEthBalance,
    shouldFetchUsdcBalance,
    shouldFetchEthBalance
  } = useBalances();
  const {
    accountDisplay,
    authenticatedLogout,
    loggedInEthereumAddress,
    isLoggedIn,
    loginStatus,
    exportAuthenticatedWallet
  } = useAccount();
  const { blockscanUrl } = useSmartContracts();
  const { openModal } = useModal();

  /*
   * Handler
   */

  const handleReceiveClick = () => {
    openModal(MODALS.RECEIVE);

    onOptionSelect();
  };

  const handleSendClick = () => {
    navigate('/send');

    onOptionSelect();
  };

  const handleRegistrationClick = () => {
    navigate('/register');

    onOptionSelect();
  };

  const handleLogout = async () => {
    try {
      await authenticatedLogout?.();
    } catch (error) {
      console.error("Failed to logout");
    }

    onOptionSelect();
  };

  const handleExportWallet = () => {
    exportAuthenticatedWallet?.();

    onOptionSelect();
  };

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchUsdcBalance) {
      refetchUsdcBalance?.();
    }

    if(shouldFetchEthBalance) {
      refetchEthBalance?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Helpers
   */

  const userEtherscanLink = `${blockscanUrl}/address/${loggedInEthereumAddress}`;

  const ethBalanceDisplay = ethBalance ? `${toEthString(ethBalance)} ETH` : '0 ETH';

  /*
   * Component
   */

  return (
    <Wrapper>
      <Overlay />

      <NavDropdown ref={ref}>
        <AccountAndUserIconContainer>
          <EthereumAvatar address={loggedInEthereumAddress ?? CALLER_ACCOUNT} size={42} />
          <AccountTypeLabel>
            {isLoggedIn && loginStatus === LoginStatus.AUTHENTICATED ? accountDisplay : 'Connected'}
          </AccountTypeLabel>
          <AccountAddressAndENSContainer>
            <AccountAddress>
              <Link href={userEtherscanLink} target="_blank">
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={loggedInEthereumAddress || ''}
                  customDisplay={(address) => formatAddress(address)}
                />
              </Link>
            </AccountAddress>
            <CopyButton textToCopy={loggedInEthereumAddress || ''} size={'sm'}/>
          </AccountAddressAndENSContainer>
        </AccountAndUserIconContainer>

        <BalancesAndLogoContainer>
          <UsdcSvg src={usdcSvg} />

          <BalanceContainer>
            <BalanceLabel>
              {`USDC`}
            </BalanceLabel>

            <BalanceValue>
              {usdcBalance ? toUsdcString(usdcBalance, true) : "0"}
            </BalanceValue>
          </BalanceContainer>
        </BalancesAndLogoContainer>
        
        <NavDropdownItemsContainer>
          <ItemAndIconContainer onClick={handleRegistrationClick}>
            <StyledUserCheck />

            <NavDropdownItem>
              Registration
            </NavDropdownItem>
          </ItemAndIconContainer>

          <ItemAndIconContainer onClick={handleReceiveClick}>
            <StyledArrowDownCircle />

            <NavDropdownItem>
              Receive
            </NavDropdownItem>
          </ItemAndIconContainer>
          
          <ItemAndIconContainer onClick={handleSendClick}>
            <StyledArrowUpCircle />

            <NavDropdownItem>
              Send
            </NavDropdownItem>
          </ItemAndIconContainer>

          {loginStatus === LoginStatus.EOA && (
            <ItemAndIconContainer onClick={() => window.open("https://bridge.base.org/deposit", "_blank")}>
              <StyledRepeat />
              <BridgeLinkAndBalance>
                <BridgeLink>
                  Bridge ↗
                </BridgeLink>

                <EthBalance>
                  {ethBalanceDisplay}
                </EthBalance>
              </BridgeLinkAndBalance>
            </ItemAndIconContainer>
          )}

          {loginStatus === LoginStatus.AUTHENTICATED && (
            <ItemAndIconContainer onClick={handleExportWallet}>
              <StyledKey />

              <NavDropdownItem>
                Export Wallet
              </NavDropdownItem>
            </ItemAndIconContainer>
          )}

          <ItemAndIconContainer onClick={handleLogout}>
            <StyledLogOut />
            <LogoutContainer>
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
  gap: 0.75rem;
  white-space: nowrap;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${colors.defaultBorderColor};
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

const StyledUserCheck = styled(UserCheck)`
  color: #FFF;
  height: 20px;
  width: 20px;
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

const StyledZap = styled(Zap)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const StyledRepeat = styled(Repeat)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const StyledKey = styled(Key)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const StyledLogOut = styled(LogOut)`
  color: #E96069;
  height: 20px;
  width: 20px;
`;

const BalancesAndLogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 24px;
  gap: 20px;

  font-family: 'Graphik';
  border-bottom: 1px solid ${colors.defaultBorderColor};
`;

const UsdcSvg = styled.img`
  width: 32px;
  height: 32px;
`;

const BalanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  justify-content: flex-start;
`;

const BalanceValue = styled.div`
  color: #FFFFFF;
  font-size: 24px;
`;

const BalanceLabel = styled.div`
  color: #9ca3af;
  font-size: 16px;
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
  line-height: 1;
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

    ${StyledKey},
    ${StyledUserCheck},
    ${StyledArrowUpCircle},
    ${StyledArrowDownCircle},
    ${StyledRepeat},
    ${StyledZap} {
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
  align-items: flex-end;
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
  padding-top: 2.5px;
`;
