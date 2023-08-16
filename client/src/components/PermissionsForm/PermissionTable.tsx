import React, { useEffect, useState } from 'react';
import { Filter } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { Button } from '../Button'
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { PermissionRow } from "./PermissionRow";


interface Permission {
  address: string;
}

interface PermissionTableProps {
  loggedInWalletAddress: string;
  handleNewPositionClick: () => void;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  loggedInWalletAddress,
  handleNewPositionClick
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    setPermissions([
      { address: '0x24506DC1918183960Ac04dB859EB293B115952af' },
      { address: '0x24506DC1918183960Ac04dB859EB293B115952af' }
    ]);
  }, []);

  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Permissions
          </ThemedText.HeadlineMedium>
          <Button onClick={handleNewPositionClick} height={40}>
            + New Entry
          </Button>
        </TitleRow>

        <Content>
          {!loggedInWalletAddress ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <FilterIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  Your allowed and denied wallet address will appear here.
                </div>
              </ThemedText.DeprecatedBody>
              <Button>
                Connect Wallet
              </Button>
            </ErrorContainer>
          ) : permissions.length === 0 ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
              <FilterIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  You have no restricions set.
                </div>
              </ThemedText.DeprecatedBody>
            </ErrorContainer>
          ) : (
            <PermissionsContainer>
              <PermissionCountTitle>
                <ThemedText.LabelSmall textAlign="left">
                  Your permissions ({permissions.length})
                </ThemedText.LabelSmall>
              </PermissionCountTitle>
              <Table>
                {permissions.map((permission, rowIndex) => (
                  <PermissionRowStyled key={rowIndex}>
                    <PermissionRow
                      address={permission.address}
                      rowIndex={rowIndex}
                    />
                  </PermissionRowStyled>
                ))}
              </Table>
            </PermissionsContainer>
          )}
        </Content>
      </Column>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const TitleRow = styled(RowBetween)`
  margin-bottom: 20px;
  height: 50px;
  align-items: flex-end;
  color: #FFF;
  padding: 0 1rem;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  };
`;

const Content = styled.main`
  display: flex;
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  overflow: hidden;
`;

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: 36px 0px;
  max-width: 340px;
  min-height: 25vh;
  gap: 36px;
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const FilterIcon = styled(Filter)`
  ${IconStyle}
`

const PermissionsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`

const PermissionCountTitle = styled.div`
  width: 100%;
  text-align: left;
  padding-top: 1.25rem;
  padding-bottom: 1rem;
  padding-left: 1.5rem;
  border-bottom: 1px solid #98a1c03d;
`

const Table = styled.div`
  width: 100%;
  border-radius: 8px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.25);
  font-size: 16px;
  color: #616161;

  & > * {
    border-bottom: 1px solid #98a1c03d;
  }

  & > *:last-child {
    border-bottom: none;
  }
`;

const PermissionRowStyled = styled.div`
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
