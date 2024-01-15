import styled from 'styled-components';
import React, { useEffect, useState } from "react";

import {  useNetwork } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useSwitchNetwork } from '@privy-io/wagmi-connector';
import useAccount from '@hooks/useAccount';

import Link from '@mui/material/Link';

import { AccountSelector } from "@components/modals/AccountSelector";
import { AccountDetails } from "@components/modals/AccountDetails";
import { Button } from '@components/common/Button';
import useMediaQuery from '@hooks/useMediaQuery';

interface CustomConnectButtonProps {
  fullWidth?: boolean;
  height?: number;
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  fullWidth = false,
  height = 48
}) => {
  /*
   * Contexts
   */
  const { ready, authenticated } = usePrivy();
  const { loggedInEthereumAddress, isLoggedIn } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const currentDeviceSize = useMediaQuery();
  
  /*
   * State
   */
  const [shouldShowAccountSelectorModal, setShouldShowAccountSelectorModal] = useState<boolean>(false);
  const [shouldShowAccountDetailsModal, setShouldShowAccountDetailsModal] = useState<boolean>(false);
  const [isExternalEOA, setIsExternalEOA] = useState<boolean>(false);

  /*
   * Hooks
   */
  useEffect(() => {
    if (ready && isLoggedIn && authenticated) {
      setIsExternalEOA(false);
    } else {
      setIsExternalEOA(true);
    }
  }, [ready, isLoggedIn, authenticated]);

  /*
  * Handlers
  */
  const onAccountSelectorClick = () => {
    setShouldShowAccountSelectorModal(true);
  };

  const onCloseAccountSelectorModal = () => {
    setShouldShowAccountSelectorModal(false);
  };

  const onAccountDetailsClick = () => {
    setShouldShowAccountDetailsModal(true);
  };

  const onCloseAccountDetailsModal = () => {
    setShouldShowAccountDetailsModal(false);
  };

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
              onClick={() => switchNetwork?.(11155111)} // TODO: use env
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

        // Case 3: User is logged in to Privy which is prioritized over external EOA
        if (ready && isLoggedIn && authenticated) {
          return (
            <LoggedInButton onClick={onAccountDetailsClick}>
              {loggedInEthereumAddress?.slice(0, 6)}...{loggedInEthereumAddress?.slice(-4)}
            </LoggedInButton>
          );
        }

        // Case 4: User is logged in to external EOA
        return (
          <div style={{ display: 'flex', gap: 12 }}>
            <NetworkAndBridgeContainer>
              <NetworkSelector style={{ display: 'flex', alignItems: 'center' }}>
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
              <LoggedInButton onClick={onAccountDetailsClick}>
                {loggedInEthereumAddress?.slice(0, 6)}...{loggedInEthereumAddress?.slice(-4)}
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
      {
        shouldShowAccountDetailsModal && (
          <AccountDetails onBackClick={onCloseAccountDetailsModal} isExternalEOA={isExternalEOA} />
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

const NetworkSelector = styled.div`
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
