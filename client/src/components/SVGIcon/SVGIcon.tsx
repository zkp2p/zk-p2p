import React from 'react';
import { ReactComponent as DefaultTokenLogo } from '../../icons/svg/ethereum-token-logo.svg';
import { ReactComponent as LightGithubLogo } from '../../icons/svg/light-github.svg';
import { ReactComponent as DarkGithubLogo } from '../../icons/svg/dark-github.svg';
import { ReactComponent as LightTwitterLogo } from '../../icons/svg/light-twitter.svg';
import { ReactComponent as DarkTwitterLogo } from '../../icons/svg/dark-twitter.svg';

import './SVGIcon.css';


interface SVGIconProps {
  iconName: string
};

export const SVGIcon: React.FC<SVGIconProps> = ({
  iconName = 'ethereum-logo'
}) => {
  let Icon;
  switch (iconName) {
    case 'light-github':
      Icon = LightGithubLogo;
      break;

    case 'dark-github':
      Icon = DarkGithubLogo;
      break;

    case 'light-twitter':
      Icon = LightTwitterLogo;
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

  return <Icon className="svg" />;
};
