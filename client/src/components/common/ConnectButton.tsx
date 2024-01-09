import styled from 'styled-components';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect, useNetwork } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { usePrivySmartAccount } from "@zerodev/privy";
import { useSwitchNetwork } from '@privy-io/wagmi-connector';
import useAccount from '@hooks/useAccount';

import Link from '@mui/material/Link';

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
  // Privy hooks
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();

  // wagmi hooks
  const { chain } = useNetwork();
  const {disconnect} = useDisconnect();

  // ZKP2P hooks
  const { isLoggedIn, loggedInEthereumAddress, network } = useAccount();
  console.log(chain, isLoggedIn);

  const {wallet: activeWallet, setActiveWallet} = usePrivyWagmi();

  // WAGMI hooks
  // const {address, isLoggedIn, isauthenticated, isConnecting, isDisauthenticated} = useAccount();
  // const {disconnect} = useDisconnect();
  // const {chain} = useNetwork();

  // Note: If your app doesn't use authentication, you
  // can remove all 'authenticationStatus' checks
  // const ready = mounted && authenticationStatus !== 'loading';
  // const authenticated =
  //   ready &&
  //   authenticated &&
  //   chain


  const currentDeviceSize = useMediaQuery();

  return (
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        // const ready = mounted && authenticationStatus !== 'loading';
        // const connected =
        //   ready &&
        //   account &&
        //   chain &&
        //   (!authenticationStatus ||
        //     authenticationStatus === 'authenticated');

        // return (
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
                    onClick={connectWallet}
                    height={height}
                  >
                    {currentDeviceSize === 'mobile' ? 'Connect' : 'Connect Wallet'}
                  </Button>
                );
              }

              if (!network && chain.unsupported) {
                return (
                  <Button
                    fullWidth={fullWidth}
                    // onClick={openChainModal}
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
                      // onClick={openChainModal}
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
                    <LoggedInBalanceAndAccount onClick={disconnect}>
                      {/* <AccountBalance>
                        {account.displayBalance}
                      </AccountBalance> */}

                      <LoggedInButton>
                        {loggedInEthereumAddress}
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
        // );
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
