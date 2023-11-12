import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { Button } from '../Button';
import useMediaQuery from '@hooks/useMediaQuery';


interface CustomConnectButtonProps {
  fullWidth?: boolean;
  height?: number;
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  fullWidth = false,
  height = 48
}) => {
  const currentDeviceSize = useMediaQuery();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
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
            {(() => {
              if (!connected) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    onClick={openConnectModal}
                    height={height}
                  >
                    {currentDeviceSize === 'mobile' ? 'Connect' : 'Connect Wallet'}
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

                  <LoggedInBalanceAndAccount onClick={openAccountModal}>
                    <AccountBalance>
                      {account.displayBalance}
                    </AccountBalance>
                    <LoggedInButton>
                      {account.displayName}
                    </LoggedInButton>
                  </LoggedInBalanceAndAccount>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

const NetworkSelector = styled.button`
  border: none;
  background: #1A1B1F;
  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
  font-size: 16px;
  border-radius: 24px;
  padding: 8px 16px;
`;

const LoggedInBalanceAndAccount = styled.div`
  display: flex;
  align-items: stretch;
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
  font-size: 16px;
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
  font-size: 16px;
  align-self: stretch;
  padding: 0px 20px;
`;
