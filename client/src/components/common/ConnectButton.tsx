import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ENSName } from 'react-ens-name';

import { EthereumAvatar } from "@components/Account/Avatar";
import { Button } from '@components/common/Button';
import { AccountDropdown } from "@components/Account/AccountDropdown";
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import useMediaQuery from '@hooks/useMediaQuery';
import useAccount from '@hooks/useAccount';
import { formatAddress } from '@helpers/addressFormat';
import { alchemyMainnetEthersProvider } from "index";


interface CustomConnectButtonProps {
  fullWidth?: boolean;
  height?: number;
  width?: number;
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  fullWidth = false,
  height = 48,
  width = 112
}) => {
  /*
   * Contexts
   */

  const currentDeviceSize = useMediaQuery();
  const {
    accountDisplay,
    authenticatedLogin,
    isLoggedIn,
    loggedInEthereumAddress,
    authenticatedLogout
  } = useAccount();

  /*
   * State
   */

  const [isDropdownOppen, toggleDropdown] = useReducer((s) => !s, false)

  const accountDropdownRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(accountDropdownRef, isDropdownOppen ? toggleDropdown : undefined)

  /*
   * Handlers
   */

  const onAccountLoginClick = () => {
    if (authenticatedLogin) {
      authenticatedLogin();
    };
  };

  const onWrongNetworkLogout = () => {
    if (authenticatedLogout) {
      authenticatedLogout();
    }
  };

  return (
    <ConnectButton.Custom>
      {({
        chain,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';

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
            {(() => {
              if (!isLoggedIn) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    width={width}
                    onClick={onAccountLoginClick}
                    height={height}
                  >
                    {currentDeviceSize === 'mobile' ? 'Log In' : 'Log In'}
                  </Button>
                );
              }

              if (chain && chain.unsupported) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    onClick={onWrongNetworkLogout}
                    height={height}
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex' }}>
                  <AccountContainer>
                    <NetworkAndBridgeContainer>
                      <NetworkSelector
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {chain && chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              overflow: 'hidden',
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
                      </NetworkSelector>
                    </NetworkAndBridgeContainer>

                    <LoggedInBalanceAndAccount onClick={toggleDropdown}>
                      <LoggedInButton>
                        <EthereumAvatar address={loggedInEthereumAddress || ''} />
                        <AccountDisplay>
                          {isLoggedIn ? (
                            accountDisplay
                          ) : (
                            <ENSName
                              provider={alchemyMainnetEthersProvider}
                              address={loggedInEthereumAddress || ''}
                              customDisplay={(address) => formatAddress(address)}
                            />
                          )}
                        </AccountDisplay>
                      </LoggedInButton>
                    </LoggedInBalanceAndAccount>
                  </AccountContainer>

                  {isDropdownOppen && (
                    <AccountDropdown
                      ref={accountDropdownRef}
                      onOptionSelect={toggleDropdown}
                     />
                  )}
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
  padding: 6px 10px 6px 16px;
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
`;

const LoggedInBalanceAndAccount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoggedInButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #3A3B3F;
  border-radius: 24px;
  gap: 10px;
  
  letter-spacing: 0.75px;
  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 600;
  font-size: 14px;
  align-self: stretch;
  padding: 0px 18px 0px 14px;
  cursor: pointer;

  &:hover:not([disabled]) {
    background: #4A4B4F;
  }

  &:active:not([disabled]) {
    background: #202124;
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }
`;

const AccountDisplay = styled.div`
  padding-top: 3px;
`;
