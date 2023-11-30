import React, { useState } from 'react';
import styled from "styled-components";
import Link from '@mui/material/Link';
import { X } from 'react-feather';

import {
  LOCAL_ENV_BANNER,
  STAGING_TESTNET_ENV_BANNER,
  STAGING_ENV_BANNER,
  PRODUCTION_ENV_BANNER
} from '@helpers/tooltips';


export const EnvironmentBanner: React.FC = () => {
  /*
   * State
   */

  const storedBannerSettings = localStorage.getItem('dismissedEnvironmentBanner');

  const [isEnvironmentBannerDismissed, setIsEnvironmentBannerDismissed] = useState<boolean>(
    storedBannerSettings === 'true'
  );
  
  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    setIsEnvironmentBannerDismissed(true);

    localStorage.setItem('dismissedEnvironmentBanner', 'true');
  };
  
  /* 
   * Helpers
   */

  const bannerCopyForEnv = (env: string) => {
    switch (env) {
      case 'PRODUCTION':
        return PRODUCTION_ENV_BANNER
  
      case 'STAGING_TESTNET':
        return STAGING_TESTNET_ENV_BANNER;;
  
      case 'STAGING':
        return STAGING_ENV_BANNER;
      
      default:
        return LOCAL_ENV_BANNER;
    }
  };

  const env = process.env.DEPLOYMENT_ENVIRONMENT || 'LOCAL';

  const isEnvProduction = env === 'PRODUCTION';

  /* 
   * Component
   */

  if (isEnvironmentBannerDismissed) {
    return null;
  }

  return (
    <Container>
      <div style={{ flex: 0.1 }}/>

      <StyledLabel style={{ flex: '1', margin: 'auto'}}>
        {bannerCopyForEnv(env)}
        {isEnvProduction && (
          <Link href="https://docs.zkp2p.xyz/zkp2p/developer/security#risks" color="inherit" target="_blank">
            Review Risks
          </Link>
        )}
      </StyledLabel>

      <StyledButton onClick={handleOverlayClick}>
        <StyledX/>
      </StyledButton>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: relative;
  align-items: center;
  text-align: center;
  padding: 10px 0px;
  background-color: #df2e2d;
`;

const StyledLabel = styled.span`
  flex-grow: 1;
  color: #ffffff;
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 600;
`;

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex: 0.1;
`;

const StyledX = styled(X)`
  color: #FFFFFF;
  width: 16px;
  height: 16px;
`;
