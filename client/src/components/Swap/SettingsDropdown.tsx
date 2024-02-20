import { useRef, useReducer } from 'react';
import { Settings } from 'react-feather';
import styled from "styled-components";

import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { Input } from "@components/common/Input";
import { colors } from '@theme/colors';


interface SettingsDropdownProps {
  recipientAddress?: string;
  setRecipientAddress: (address: string) => void;
  isLoggedIn: boolean;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps>= ({
  recipientAddress,
  setRecipientAddress,
  isLoggedIn,
}) => {
  /*
   * State
   */

  const [isOpen, toggleOpen] = useReducer((s) => !s, false);

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined);

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <SettingsButton onClick={toggleOpen}>
        <StyledSettings />
      </SettingsButton>

      {isOpen && (
        <Dropdown>
          <DropdownItems>
            <RecipientAddressContainer>
              Custom recipient address
            </RecipientAddressContainer>

            <RecipientInputContainer>
              <Input
                label="Recipient"
                name="recipientAddress"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder={!isLoggedIn ? 'Wallet disconnected' : 'Recipient address'}
                readOnly={!isLoggedIn}
              />
            </RecipientInputContainer>
          </DropdownItems>
        </Dropdown>
      )}
    </Wrapper>
  )
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: flex-start;
`;

const StyledSettings = styled(Settings)`
  color: #FFF;
  width: 20px;
  height: 20px;
`;

const SettingsButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dropdown = styled.div`
  display: flex;
  width: 392px;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background-color: ${colors.container};
  position: absolute;
  top: calc(100% + 20px);
  right: -12px;
  z-index: 20;
  color: #CED4DA;
`;

const DropdownItems = styled.div`
  display: flex;
  flex-direction: column;
`;

const RecipientAddressContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding-bottom: 1rem;
`;

const RecipientInputContainer = styled.div`
`;
