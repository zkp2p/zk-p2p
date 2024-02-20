import React, { useEffect } from 'react';
import styled from 'styled-components';

import { colors } from '@theme/colors';


interface OverlayProps {
  onClick?: () => void
}

export const Overlay: React.FC<OverlayProps> = ({
  onClick 
}) => {

  /*
   * Hooks
   */

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  /*
   * Component
   */

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
  background-color: ${colors.container};
  opacity: 0.75;
  overflow: hidden;
  z-index: 10;
`;
