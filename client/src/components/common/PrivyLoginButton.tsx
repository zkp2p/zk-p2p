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

interface PrivyLoginButtonProps {
  fullWidth?: boolean;
  height?: number;
}

export const PrivyLoginButton: React.FC<PrivyLoginButtonProps> = ({
  fullWidth = false,
  height = 48
}) => {
  // Privy hooks
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();

  // wagmi hooks
  const { chain } = useNetwork();
  const {disconnect} = useDisconnect();

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
        if (ready && !authenticated) {
          return (
            <Button
              fullWidth={fullWidth}
              onClick={login}
              height={height}
            >
              {currentDeviceSize === 'mobile' ? 'Login' : 'Social Login'}
            </Button>
          );
        }

        if (ready && authenticated) {
          return (
            <Button
              fullWidth={fullWidth}
              onClick={logout}
              height={height}
            >
              Logout
            </Button> // TODO: logging out of Privy doesn't update account provider state throughout the rest of the app. Same for login
          );
        }
      })()}
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
