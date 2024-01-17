import styled from 'styled-components';
import React, { useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from '@mui/material/Link';
import { usePrivy } from '@privy-io/react-auth';

import { AccountSelector } from "@components/modals/AccountSelector";
import { Button } from '@components/common/Button';
import useMediaQuery from '@hooks/useMediaQuery';
import useBalances from '@hooks/useBalance';

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
  const { authenticated } = usePrivy();
  const { usdcBalance } = useBalances();
  const currentDeviceSize = useMediaQuery();

  /*
   * State
   */
  const [shouldShowAccountSelectorModal, setShouldShowAccountSelectorModal] = useState<boolean>(false);

  /*
  * Handlers
  */
  const onAccountSelectorClick = () => {
    setShouldShowAccountSelectorModal(true);
  };

  const onCloseAccountSelectorModal = () => {
    setShouldShowAccountSelectorModal(false);
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
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
            {
              shouldShowAccountSelectorModal && (
                <AccountSelector onBackClick={onCloseAccountSelectorModal} />
              )
            }
            {(() => {
              if (!connected) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    onClick={onAccountSelectorClick}
                    height={height}
                  >
                    {currentDeviceSize === 'mobile' ? 'Login' : 'Login'}
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    onClick={openChainModal}
                    height={height}
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <NetworkAndBridgeContainer>
                    <NetworkSelector
                      onClick={openChainModal}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      {chain.hasIcon && (
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
                      {chain.name}
                    </NetworkSelector>
                  </NetworkAndBridgeContainer>

                  <AccountContainer>
                    <LoggedInBalanceAndAccount /* onClick={} */>
                      <AccountBalance>
                        { (authenticated && usdcBalance !== null) ?
                            usdcBalance.toString() + ' USDC' :   // If logged into Privy display USDC
                            account.displayBalance               // Else display ETH balance
                        }
                      </AccountBalance>

                      <LoggedInButton>
                        {account.displayName}
                      </LoggedInButton>
                    </LoggedInBalanceAndAccount>

                    {
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
                    }
                  </AccountContainer>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
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
  
  letter-spacing: 0.75px;
  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
  font-size: 15px;
  align-self: stretch;
  padding: 0px 20px;
  cursor: pointer;

  &:hover:not([disabled]) {
    background: #4A4B4F;
  }

  &:active:not([disabled]) {
    background: #202124;
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
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
