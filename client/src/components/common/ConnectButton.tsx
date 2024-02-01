import React, { useState, useReducer, useRef } from "react";
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ENSName } from 'react-ens-name';

import { AccountLogin } from "@components/Account/AccountLogin";
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
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  fullWidth = false,
  height = 48
}) => {
  /*
   * Contexts
   */

  const currentDeviceSize = useMediaQuery();
  const { accountDisplay, isLoggedIn } = useAccount();

  /*
   * State
   */

  const [shouldShowAccountLoginModal, setShouldShowAccountLoginModal] = useState<boolean>(false);

  const [isDropdownOppen, toggleDropdown] = useReducer((s) => !s, false)

  const accountDropdownRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(accountDropdownRef, isDropdownOppen ? toggleDropdown : undefined)

  /*
   * Handlers
   */

  const onAccountLoginClick = () => {
    setShouldShowAccountLoginModal(true);
  };

  const onCloseAccountLoginModal = () => {
    setShouldShowAccountLoginModal(false);
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
              shouldShowAccountLoginModal && (
                <AccountLogin onBackClick={onCloseAccountLoginModal} />
              )
            }
            {(() => {
              if (!connected) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    width={112}
                    onClick={onAccountLoginClick}
                    height={height}
                  >
                    {currentDeviceSize === 'mobile' ? 'Log In' : 'Log In'}
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
                <div style={{ display: 'flex' }}>
                  <AccountContainer>
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
                        {isLoggedIn ? (
                          accountDisplay
                        ) : (
                          <ENSName
                            provider={alchemyMainnetEthersProvider}
                            address={account.address || ''}
                            customDisplay={(address) => formatAddress(address)}
                          />
                        )}
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
  padding: 6px 12px 6px 16px;
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
  gap: 12px;
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
  font-weight: 600;
  font-size: 14px;
  align-self: stretch;
  padding: 0px 20px;
  padding-top: 2px;
  cursor: pointer;

  &:hover:not([disabled]) {
    background: #4A4B4F;
  }

  &:active:not([disabled]) {
    background: #202124;
    box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
  }
`;
