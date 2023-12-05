import React, { useEffect, useState, ReactNode } from 'react'
import {
  hasGrantedAllScopesGoogle,
  useGoogleLogin,
  googleLogout,
} from '@react-oauth/google';

import { esl } from '@helpers/constants';
import useAccount from '@hooks/useAccount';
import {  fetchProfile } from '@hooks/useGmailClient';

import GoogleAuthContext from './GoogleAuthContext'


interface ProvidersProps {
  children: ReactNode;
}

const GoogleAuthProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { loggedInEthereumAddress } = useAccount()

  /*
   * State Keys
   */

  const getGoogleAuthTokenKey = () => {
    return `googleAuthToken_${loggedInEthereumAddress}`;
  }

  /*
   * State
   */

  const [googleAuthToken, setGoogleAuthToken] = useState<any | null>(
    () => {
      const cachedToken = localStorage.getItem(getGoogleAuthTokenKey());
      return cachedToken ? JSON.parse(cachedToken) : null;
    }
  );

  const [isGoogleAuthed, setIsGoogleAuthed] = useState<boolean>(false);
  const [isScopesApproved, setIsScopesApproved] = useState<boolean>(false);
  const [loggedInGmail, setLoggedInGmail] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('logoOutGoogleAuth');
    esl && console.log('checking loggedInEthereumAddress', loggedInEthereumAddress);

    if (!loggedInEthereumAddress) {
      esl && console.log('logoOutGoogleAuth_1');

      googleLogOut();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('googleAuthScopes_1');
    esl && console.log('checking googleAuthToken', googleAuthToken);

    if (googleAuthToken) {
      esl && console.log('googleAuthScopes_2');

      const allScope = hasGrantedAllScopesGoogle(
        googleAuthToken,
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      );
      
      setIsScopesApproved(allScope);
    }
  }, [googleAuthToken]);

  useEffect(() => {
    esl && console.log('googleProfile_1');
    esl && console.log('checking googleAuthToken', googleAuthToken);

    if (googleAuthToken) {
      esl && console.log('googleProfile_2');

      const fetchData = async () => {
        try {
          const email = await fetchProfile(googleAuthToken.access_token);

          if (email) {
            setLoggedInGmail(email);

            localStorage.setItem('loggedInEmail', email);
          }
        } catch (error) {
          console.error('Error in fetching profile data:', error);
        }
      };
    
      fetchData();
    };
  }, [googleAuthToken]);

  /*
   * Helpers
   */

  const googleLogIn = useGoogleLogin({
    onSuccess: tokenResponse => {
      setGoogleAuthToken(tokenResponse);
      setIsGoogleAuthed(true);

      localStorage.setItem(getGoogleAuthTokenKey(), JSON.stringify(tokenResponse));
    },
    scope: 'email profile https://www.googleapis.com/auth/gmail.readonly',
  });

  const googleLogOut = () => {
    setGoogleAuthToken(null);
    localStorage.removeItem(getGoogleAuthTokenKey());
  
    setIsGoogleAuthed(false);
    localStorage.removeItem('isGoogleAuthed');
  
    setLoggedInGmail(null);
    localStorage.removeItem('loggedInGmail');
  
    googleLogout();
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        googleAuthToken,
        isGoogleAuthed,
        loggedInGmail,
        scopesApproved: isScopesApproved,
        googleLogIn,
        googleLogOut,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export default GoogleAuthProvider
