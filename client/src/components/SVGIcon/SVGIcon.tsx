import React from 'react';

import { ReactComponent as DefaultTokenLogo } from '../../icons/svg/ethereum-token-logo.svg';
import { ReactComponent as DarkGithubLogo } from '../../icons/svg/dark-github.svg';
import { ReactComponent as DarkTwitterLogo } from '../../icons/svg/dark-twitter.svg';
import { ReactComponent as DarkUsdcLogo } from '../../icons/svg/dark-usdc.svg';
import { ReactComponent as DarkTelegramLogo } from '../../icons/svg/dark-telegram.svg';

import './SVGIcon.css';


interface SVGIconProps {
  iconName: string
  width?: string,
  height?: string,
};

export const SVGIcon: React.FC<SVGIconProps> = ({
  iconName = 'ethereum-logo',
  width,
  height
}) => {
  let Icon;
  switch (iconName) {
    case 'dark-telegram':
      Icon = DarkTelegramLogo;
      break;

    case 'dark-github':
      Icon = DarkGithubLogo;
      break;

    case 'dark-usdc':
      Icon = DarkUsdcLogo;
      break;

    case 'dark-twitter':
      Icon = DarkTwitterLogo;
      break;

    case 'ethereum-logo':
      Icon = DefaultTokenLogo;
      break;

    default:
      Icon = DefaultTokenLogo;
  }

  return <Icon className="svg" width={width} height={height} />;
};
