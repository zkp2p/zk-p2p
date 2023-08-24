import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { Button } from '../Button';


interface CustomConnectButtonProps {
  height?: number;
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  height = 48
}) => {

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
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} height={height}>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
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
  padding: 10px 16px;
`;

const LoggedInBalanceAndAccount = styled.div`
  display: flex;
  align-items: stretch;
  border-radius: 24px;
  background: #1A1B1F;
  gap: 16px;
`;

const AccountBalance = styled.div`
  display: flex;
  align-items: center;
  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
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
  letter-spacing: 0.5px;
  color: #ffffff;
  font-family: 'Graphik';
  font-weight: 700;
  font-size: 16px;
  align-self: stretch;
  padding: 0px 16px;
`;
