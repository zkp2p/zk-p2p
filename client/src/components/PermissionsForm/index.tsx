import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { useAccount } from "wagmi";

import { AutoColumn } from '../layouts/Column'
import { NewPermission } from './NewPermission'
import { PermissionTable } from './PermissionTable'


export default function PermissionsForm() {
  const { address } = useAccount();

  /*
    State
  */
  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");
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

  /*
    Hooks
  */

  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
    } else {
      setEthereumAddress("");
    }
  }, [address]);

  return (
    <Wrapper>
      <Column>
        <Content>
          {!isAddPosition ? (
            <PermissionTable
              loggedInWalletAddress={ethereumAddress}
              handleNewPositionClick={handleUpdateClick}
            />
          ) : (
            <NewPositionContainer>
              <Column>
                <NewPermission
                  loggedInWalletAddress={'0x123'}
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
