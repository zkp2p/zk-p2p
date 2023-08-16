import React from "react";
import styled from 'styled-components';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface PermissionRowProps {
  address: string;
  rowIndex: number;
}

export const PermissionRow: React.FC<PermissionRowProps> = ({
  address,
  rowIndex,
}: PermissionRowProps) => {
  PermissionRow.displayName = "PermissionRow";

  const outstandingAndRemainingLabel = `${address}`;

  return (
    <Container>
      <AddressContainer>
        <SVGIconThemed icon={'usdc'} width={'22'} height={'22'}/>
        <AddressLabel> {outstandingAndRemainingLabel} </AddressLabel>
      </AddressContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.5rem 1.5rem;
  background-color: #0D111C;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const AddressContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  gap: 1rem;
  line-height: 24px;
`;

const AddressLabel = styled.label`
  display: flex;
  font-size: 16px;
  color: #FFFFFF;
  align-items: center;
`;
