import React from "react";
import styled, { css, keyframes } from 'styled-components/macro'


interface SpinnerProps extends React.ComponentPropsWithoutRef<'svg'> {
  color?: string;
  size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ color = '#FFFFFF', size = 24, ...props }) => (
  <SpinnerSVG color={color} width={size} height={size} viewBox="0 0 24 24" {...props}>
    <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"></path>
  </SpinnerSVG>
);

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerCss = css`
  animation: 0.7s ${rotate} linear infinite;
`;

export const SpinnerSVG = styled.svg`
  ${SpinnerCss}

  path {
    fill: ${({ color }) => color};
  }
`;

export default Spinner
