import React from 'react';
import { Inbox } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { Button } from '../Button'
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'


interface PositionTableProps {
  loggedInWalletAddress: string;
  handleNewPositionClick: () => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  loggedInWalletAddress,
  handleNewPositionClick
}) => {
  return (
    <Wrapper>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Pool
          </ThemedText.HeadlineMedium>
          <Button onClick={handleNewPositionClick} height={40}>
            + New Position
          </Button>
        </TitleRow>

        <Content>
          <ErrorContainer>
            <ThemedText.DeprecatedBody textAlign="center">
            <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
            <div>
              Your active pool positions will appear here.
            </div>
            </ThemedText.DeprecatedBody>
            <Button>
              Connect Wallet
            </Button>
          </ErrorContainer>
        </Content>
      </Column>
    </Wrapper>
  )
}

const Wrapper = styled.div`
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
  padding: 36px 0px;
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
  max-width: 340px;
  min-height: 25vh;
  gap: 36px;
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`
