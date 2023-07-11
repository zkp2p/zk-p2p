import React from 'react';

import { SVGIconThemed } from '../../SVGIcon/SVGIconThemed';
import './style.css';


const zkp2pInfoData = [
  {
    icon: 'github',
    title: 'Github',
    value: 'https://github.com/zkp2p',
  },
  {
    icon: 'twitter',
    title: 'Twitter',
    value: 'https://twitter.com/zkp2p',
  },
];

export const BottomNav: React.FC = () => {
  const jumpToMedia = (url: string) => {
    window.open(url, '_blank');
  };

  const openTerms = () => {
    window.open('https://google.com', '_blank');
  };

  return (
    <div className="bottom-nav">
      <div className="links">
        <div className="links-content">
          {zkp2pInfoData.map((item) => (
            <span key={item.title} className="links-item">
              <SVGIconThemed
                icon={item.icon}
                onClick={() => jumpToMedia(item.value)}
                className="links-icon"
              />
            </span>
          ))}
        </div>
      </div>
      <div className="terms" onClick={openTerms}>
        Terms of Use
      </div>
    </div>
  );
};
