import styled from 'styled-components';
import React, { useState } from "react";

// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect, useNetwork } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { usePrivySmartAccount } from "@zerodev/privy";
import { useSwitchNetwork } from '@privy-io/wagmi-connector';
import useAccount from '@hooks/useAccount';

import Link from '@mui/material/Link';

import { AccountSelector } from "@components/modals/AccountSelector";
import { Button } from '@components/common/Button';
import useMediaQuery from '@hooks/useMediaQuery';

interface AccountSelectorButtonProps {
  fullWidth?: boolean;
  height?: number;
}

export const AccountSelectorButton: React.FC<AccountSelectorButtonProps> = ({
  fullWidth = false,
  height = 48
}) => {
  const [shouldShowAccountSelectorModal, setShouldShowAccountSelectorModal] = useState<boolean>(false);

  // Privy hooks
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();
  const { loggedInEthereumAddress, isLoggedIn } = useAccount();

  // wagmi hooks
  const { chain } = useNetwork();
  const {disconnect} = useDisconnect();

  const {wallet: activeWallet, setActiveWallet} = usePrivyWagmi();

  const onAccountSelectorClick = () => {
    setShouldShowAccountSelectorModal(true);
  };

  const onCloseAccountSelectorModal = () => {
    setShouldShowAccountSelectorModal(false);
  };

  const currentDeviceSize = useMediaQuery();

  return (
    // Case 1: App is loading
    <div
      {...(!ready && {
        'style': {
          width: '100%',
          opacity: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        },
      })}
    >
      {(() => {

        if (chain?.unsupported) {
          return (
            <Button
              fullWidth={fullWidth}
              // onClick={openChainModal} // TODO: Implement this
              height={height}
            >
              Wrong Network
            </Button>
          );
        }
        
        // Case 2: User is not logged in
        if (ready && !isLoggedIn) {
          return (
            <Button
              fullWidth={fullWidth}
              onClick={onAccountSelectorClick}
              height={height}
            >
              {currentDeviceSize === 'mobile' ? 'Login' : 'Login or Connect'}
            </Button>
          );
        }

        // Case 3: User is logged in to Privy which is prioritized over EOA
        if (ready && isLoggedIn && authenticated) {
          return (
            <LoggedInButton onClick={() => {
              logout(); // Logout from Privy
              disconnect(); // And disconnect from any EOA
            }}>
              {loggedInEthereumAddress?.slice(0, 4)}...{loggedInEthereumAddress?.slice(-4)}
            </LoggedInButton>
          );
        }

        // Case 4: User is logged in to EOA
        return (
          <div style={{ display: 'flex', gap: 12 }}>
            <NetworkAndBridgeContainer>
              <NetworkSelector
                // onClick={openChainModal}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {chain?.hasIcon && (
                  <div
                    style={{
                      background: chain.iconBackground,
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      overflow: 'hidden',
                      marginRight: 8,
                    }}
                  >
                    {chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        style={{ width: 24, height: 24 }}
                      />
                    )}
                  </div>
                )}
                {chain?.name}
              </NetworkSelector>
            </NetworkAndBridgeContainer>
            <AccountContainer>
              <LoggedInButton onClick={disconnect}>
                {loggedInEthereumAddress?.slice(0, 4)}...{loggedInEthereumAddress?.slice(-4)}
              </LoggedInButton>

              {
                (chain?.name === 'Base') && (
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
              }
            </AccountContainer>
          </div>
        )

      })()}
      {
        shouldShowAccountSelectorModal && (
          <AccountSelector onBackClick={onCloseAccountSelectorModal} />
        )
      }
    </div>
  );
};

const NetworkAndBridgeContainer = styled.div`
  display: flex;
  border-radius: 24px;
  background: #1A1B1F;
`;

const NetworkSelector = styled.button`
  border: none;
  background: #1A1B1F;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 24px;

  font-family: 'Graphik';
  font-weight: 700;
  color: #ffffff;
  font-size: 16px;
`;

const AccountContainer = styled.div`
  display: flex;
  border-radius: 24px;
  background: #1A1B1F;
  gap: 12px;
`;

const AccountBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
  letter-spacing: 0.25px;
  font-size: 15px;
`;

const LoggedInBalanceAndAccount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-left: 16px;
`;

const LoggedInButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #3A3B3F;
  border-radius: 24px;
  height: 40px;
  
  letter-spacing: 0.75px;
  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
  font-size: 15px;
  align-self: stretch;
  padding: 0px 20px;
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
