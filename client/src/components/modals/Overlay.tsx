import React from 'react';
import styled from 'styled-components';


interface OverlayProps {
  onClick?: () => void
}

export const Overlay: React.FC<OverlayProps> = ({
  onClick 
}) => {
  return (
    <OverlayContainer onClick={onClick} />
  );
};

const OverlayContainer = styled.div`
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  display: block;
  background-color: #0D111C;
  opacity: 0.84;
  overflow: hidden;
  z-index: 10;
`;
