import React from 'react';


const ethereumAddressToGradient = (ethereumAddress: string): string => {
  if (!ethereumAddress.startsWith('0x') || ethereumAddress.length !== 42) {
    console.error('Invalid Ethereum address');
    return '';
  }

  const color1 = `#${ethereumAddress.substring(2, 8)}`;
  const color2 = `#${ethereumAddress.substring(34, 40)}`;

  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

interface EthereumAvatarProps {
  address: string;
  size?: number;
}

export const EthereumAvatar: React.FC<EthereumAvatarProps> = ({ address, size = 24 }) => {
  const gradient = ethereumAddressToGradient(address);

  return (
    <div
      style={{
        width: `${size}px`, // Use the size prop for width
        height: `${size}px`, // Use the size prop for height
        borderRadius: '50%',
        background: gradient,
        display: 'inline-block',
      }}
    />
  );
};