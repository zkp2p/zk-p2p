import React, { CSSProperties } from 'react';

import { SVGIcon } from './SVGIcon';
import './SVGIconThemed.css';


interface SVGIconThemedProps {
    iconName?: string,
    icon?: string,
    size?: string,
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
    size = 'lg',
    lightOpacity = 0.4,
    darkOpacity = 0.4,
    width,
    height,
    themeMode = 'dark',
    onClick,
    className
}) => {
  const styles: CSSProperties = {};
  
  if (width) {
    styles.width = width;
  }

  if (height) {
    styles.height = height;
  }
  
  const showedClass = `svg-icon-${size} ${className}`;
  
  const showedIconName = typeof icon === 'string'
    ? `${themeMode}-${icon}`
    : iconName;

  console.log(showedIconName);
  
  const isLightMode = themeMode === 'light';
  
  const color = isLightMode
    ? `rgba(51, 51, 51, ${lightOpacity})`
    : `rgba(23, 23, 23, ${darkOpacity})`;
  styles.backgroundColor = color;

  return (
    <div className={showedClass} style={styles} onClick={onClick}>
      <SVGIcon iconName={showedIconName} />
    </div>
  );
};
