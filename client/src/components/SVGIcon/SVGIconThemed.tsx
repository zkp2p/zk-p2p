import React, { CSSProperties } from 'react';

import { SVGIcon } from './SVGIcon';
import './SVGIcon.css';

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
    lightOpacity = 0.4,
    darkOpacity = 0.4,
    size,
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

  const showedClass = `svg-icon-${size} ${className}`;

  return (
    <div
      style={styles}
      onClick={onClick}
      className={showedClass}
    >
        <SVGIcon iconName={showedIconName} width={width} height={height} />
    </div>
  );
};
