import { useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';
import { useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { usePrivy } from '@privy-io/react-auth';

import { esl } from '@helpers/constants';
import { LoginStatus, LoginStatusType } from '@helpers/types';
import { formatAddress } from '@helpers/addressFormat';

import AccountContext from './AccountContext';


interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { status: connectStatus } = useConnect();
  
  const { wallets } = useWallets();
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();
  const {
    authenticated,
    logout: authenticatedLogout,
    user,
    login: authenticatedLogin,
    exportWallet: exportAuthenticatedWallet
  } = usePrivy();

  /*
   * State
   */

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatusType>(LoginStatus.LOGGED_OUT);
  const [loggedInEthereumAddress, setLoggedInEthereumAddress] = useState<string | null>(null);
  const [accountDisplay, setAccountDisplay] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    console.log('activeWallet_1');
    console.log('checking wallets: ', wallets);
    console.log('checking activeWallet: ', activeWallet);

    if (wallets[0] && !activeWallet) {
      console.log('activeWallet_2');
      setActiveWallet(wallets[0]);
    }
  }, [activeWallet, wallets, setActiveWallet]);

  useEffect(() => {
    console.log('loginStatus_1');
    console.log('user: ', user);

    if (authenticated && user?.wallet?.connectorType) {
      const connectorType = user.wallet.connectorType;
      if (connectorType === 'embedded') {
        console.log('loginStatus_2');

        setLoginStatus(LoginStatus.AUTHENTICATED);
      } else if (connectorType === 'injected' || connectorType === 'coinbase_wallet' || connectorType === 'wallet_connect') {
        console.log('loginStatus_3');

        setLoginStatus(LoginStatus.EOA);
      } else {
        console.log('loginStatus_4');

        setLoginStatus(LoginStatus.LOGGED_OUT);
      }
    } else {
      console.log('loginStatus_5');

      setLoginStatus(LoginStatus.LOGGED_OUT);
    }
  }, [authenticated, user]);

  useEffect(() => {
    console.log('isLoggedIn_1');
    console.log('checking loginStatus: ', loginStatus);
    console.log('user: ', user);
    console.log('address: ', address);
    
    switch (loginStatus) {
      case LoginStatus.AUTHENTICATED:
        if (address && user) {
          console.log('isLoggedIn_2');

          if (user.email && user.email.address) {
            setAccountDisplay(user.email.address);
          } else if (user.google && user.google.email) {
            setAccountDisplay(user.google.email);
          } else if (user.twitter && user.twitter.username) {
            setAccountDisplay(user.twitter.username);
          } else if (user.farcaster && user.farcaster.displayName) {
            setAccountDisplay(user.farcaster.displayName);
          } else {
            setAccountDisplay('Account');
          }

          setIsLoggedIn(true);
          setLoggedInEthereumAddress(address);
        }
        break;

      case LoginStatus.EOA:
        if (address) {
          console.log('isLoggedIn_3');

          const formattedAddress = formatAddress(address);

          setAccountDisplay(formattedAddress);
          setIsLoggedIn(true);
          setLoggedInEthereumAddress(address);
        }
        break;
      
      case LoginStatus.LOGGED_OUT:
      default:
        console.log('isLoggedIn_4');

        setAccountDisplay(null);
        setIsLoggedIn(false);
        setLoggedInEthereumAddress(null);
    }
  }, [user, address, loginStatus, disconnect]);

  useEffect(() => {
    console.log('networkRaw_1');
    console.log('checking chain: ', chain);

    if (chain) {
      console.log('networkRaw_2');

      setNetwork(chain.network);
    } else {
      console.log('networkRaw_3');

      setNetwork(null);
    }
  }, [chain]);

  return (
    <AccountContext.Provider
      value={{
        isLoggedIn,
        loggedInEthereumAddress,
        loginStatus,
        authenticatedLogin,
        authenticatedLogout,
        accountDisplay,
        network,
        connectStatus,
        exportAuthenticatedWallet
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
