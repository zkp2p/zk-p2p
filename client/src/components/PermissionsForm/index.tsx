import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { AutoColumn } from '../layouts/Column'
import { NewPermission } from './NewPermission'
import { PermissionTable } from './PermissionTable'
import useAccount from '@hooks/useAccount'


export default function PermissionsForm() {
  /*
   * State
   */
  const [isAddPosition, setIsAddPosition] = useState<boolean>(false);

  /*
    Handlers
  */
  const handleUpdateClick = () => {
    setIsAddPosition(true);
  }

  const handleBackClick = () => {
    setIsAddPosition(false);
  }

  return (
    <Wrapper>
      <Column>
        <Content>
          {!isAddPosition ? (
            <PermissionTable
              handleNewPositionClick={handleUpdateClick}
            />
          ) : (
            <NewPositionContainer>
              <Column>
                <NewPermission
                  handleBackClick={handleBackClick}
                />
              </Column>
            </NewPositionContainer>
          )}
        </Content>
      </Column>
    </Wrapper>
  )
}

const Wrapper = styled(AutoColumn)`
  max-width: 660px;
  width: 100%;
  padding-top: 1.5rem;
`

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const Content = styled.main`
  gap: 1rem;
  align-self: flex-start;
`;

const NewPositionContainer = styled.div`
  display: grid;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;
