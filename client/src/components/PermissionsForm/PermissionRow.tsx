import React from "react";
import { UserX } from 'react-feather'
import styled, { css } from 'styled-components/macro'


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
        <UserXIcon strokeWidth={1.5} />
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


  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const IconStyle = css`
  width: 24px;
  height: 24px;
  color: #6C757D;
`

const UserXIcon = styled(UserX)`
  ${IconStyle}
`

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
