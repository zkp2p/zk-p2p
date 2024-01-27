import { forwardRef, useRef, useReducer } from 'react';
import { User, Copy } from 'react-feather';
import { Link as RouterLink } from 'react-router-dom';
import styled from "styled-components";
import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect } from 'wagmi';
import Link from '@mui/material/Link';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';
import { formatAddress } from '@helpers/addressFormat';

// import { TransferModal } from '@components/Account/TransferModal';
import useAccount from '@hooks/useAccount';
import useBalances from '@hooks/useBalance';
import useSmartContracts from "@hooks/useSmartContracts";
import { ThemedText } from '@theme/text';
import { toUsdcString } from "@helpers/units";
import { alchemyMainnetEthersProvider } from "index";
import { format } from 'path';


export const AccountDropdown = forwardRef<HTMLDivElement>((props, ref) => {
  /*
   * Contexts
   */

  const { authenticated, logout } = usePrivy();
  const { disconnect } = useDisconnect();
  const { usdcBalance, ethBalance } = useBalances();
  const { loggedInEthereumAddress } = useAccount();
  const { blockscanUrl } = useSmartContracts();

  /*
   * Handler
   */

  // const jumpToMedia = (url: string) => {
  //   window.open(url, '_blank');
  // };

  const handleLogout = async () => {
    if (authenticated) {
      await logout();
    }

    await disconnect();
  };

  /*
   * Helpers
   */

  const depositorEtherscanLink = `${blockscanUrl}/address/${loggedInEthereumAddress}`;

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <NavDropdown>
        <AccountAndUserIconContainer>
          <IconBorder>
            <StyledUser />
          </IconBorder>
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
            <AccountAddress>
              {loggedInEthereumAddress ? formatAddress(loggedInEthereumAddress) : formatAddress(undefined)}
            </AccountAddress>
          </AccountAddressAndENSContainer>
          <StyledCopy />
        </AccountAndUserIconContainer>

        <BalancesContainer>
          {
            usdcBalance !== null && usdcBalance !== undefined ?
              `${toUsdcString(usdcBalance, true)} USDC` :
              ethBalance !== null && ethBalance !== undefined ?
                `${ethBalance.toString()} ETH` :
                'No balance available'
          }
        </BalancesContainer>
        
        <NavDropdownItemsContainer>
          <NavDropdownItem as={RouterLink} to="/tos">
            Deposit
          </NavDropdownItem>
          
          <NavDropdownItem as={RouterLink} to="/withdraw">
            Withdraw
          </NavDropdownItem>

          <NavDropdownItem as={RouterLink} to="/tos">
            Bridge ↗
          </NavDropdownItem>

          {/* {
            (chain.name === 'Base') && (
              <BridgeLink>
                <Link
                  href={ "https://bridge.base.org/deposit" }
                  target="_blank"
                  color="inherit"
                  underline="none"
                >
                  Bridge
                </Link>
              </BridgeLink>
            )
          } */}
        </NavDropdownItemsContainer>

        <LogoutContainer onClick={handleLogout}>
          Logout
        </LogoutContainer>
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
  min-width: 280px;
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
  flex-direction: row;
  gap: 1rem;
  white-space: nowrap;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #98a1c03d;
`;

const AccountAddressAndENSContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AccountAddress = styled.div`
  padding-top: 2px;
`;

const StyledUser = styled(User)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const StyledCopy = styled(Copy)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const IconBorder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  border: 1px solid #FFF;
`;

const BalancesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;

  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
  font-size: 28px;
  border-bottom: 1px solid #98a1c03d;
`;

const NavDropdownItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  white-space: nowrap;
`;

const NavDropdownItem = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background-color: #191D28;
    box-shadow: none;
  }
`;

const LogoutContainer = styled.div`
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  padding: 16px 24px 20px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background-color: #191D28;
    border-radius: 0 0 16px 16px;
  }
`;

const BridgeLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1A1B1F;
  border-radius: 24px;
  letter-spacing: 0.75px;
  align-self: stretch;
  padding-right: 16px;
  margin-left: -6px;

  font-family: 'Graphik';
  font-weight: 700;
  color: #ffffff;
  font-size: 16px;
`;
