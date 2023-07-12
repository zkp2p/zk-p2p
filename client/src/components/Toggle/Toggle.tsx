import React, { useState } from 'react';

import './Toggle.css';


export const Toggle: React.FC = () => {
  const [isSwapTab, setIsSwapTab] = useState(true);

  const toggleTab = (target: string) => {
    const tab = (typeof target === 'string' && target) || 'Swap';
    setIsSwapTab(tab === 'Swap');
  };

  return (
    <div className="toggle-btn-box">
      <span
        onClick={() => toggleTab('Swap')}
        className={`tab-btn-item ${isSwapTab ? 'selected' : ''}`}
      >
        Swap
      </span>
      <span
        onClick={() => toggleTab('Pool')}
        className={`tab-btn-item ${!isSwapTab ? 'selected' : ''}`}
      >
        Pool
      </span>
    </div>
  );
};
