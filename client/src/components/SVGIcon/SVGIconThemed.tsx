import React, { CSSProperties } from 'react';

import { SVGIcon } from './SVGIcon';


interface SVGIconThemedProps {
    iconName?: string,
    icon?: string,
    lightOpacity?: number,
    darkOpacity?: number,
    width?: string,
    height?: string,
    themeMode?: string,
    onClick?: () => void,
    className?: string
  };

export const SVGIconThemed: React.FC<SVGIconThemedProps> = ({
    iconName = 'ethereum-logo',
    icon,
    lightOpacity = 0.4,
    darkOpacity = 0.4,
    width,
    height,
    themeMode = 'dark',
    onClick,
    className
}) => {
  const styles: CSSProperties = {
    display: 'flex'
  };
  
  const showedIconName = typeof icon === 'string'
    ? `${themeMode}-${icon}`
    : iconName;
  
  const isLightMode = themeMode === 'light';
  
  const color = isLightMode
    ? `rgba(51, 51, 51, ${lightOpacity})`
    : `rgba(23, 23, 23, ${darkOpacity})`;
  styles.backgroundColor = color;

  return (
    <div
      style={styles}
      onClick={onClick}>
        <SVGIcon iconName={showedIconName} width={width} height={height} />
    </div>
  );
};
