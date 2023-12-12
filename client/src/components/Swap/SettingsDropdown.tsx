import { useRef, useReducer, useMemo } from 'react';
import { ChevronDown, Settings } from 'react-feather';
import styled from "styled-components";
import { Switch } from '@mui/material';
import { useNavigate } from 'react-router-dom'

import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { Input } from "@components/common/Input";
import { commonStrings } from "@helpers/strings";
import useLiquidity from '@hooks/useLiquidity';


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
  const navigate = useNavigate();

  /*
   * Contexts
   */

  const { targetedDepositIds } = useLiquidity();

  /*
   * State
   */

  const [isOpen, toggleOpen] = useReducer((s) => !s, false)
  const [isRecipientAddressInputOpen, toggleRecipientAddressInputOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Hooks
   */

  const isTargetedLiquidityEnabled = useMemo(() => {
    return targetedDepositIds !== null && targetedDepositIds.length > 0;
  }, [targetedDepositIds]);

  /*
   * Handlers
   */

  const navigateToLiquidityHandler = () => {
    navigate('/liquidity');
  };

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
              Custom recipient

              <StyledChevronDown
                onClick={toggleRecipientAddressInputOpen}
                $isOpen={isRecipientAddressInputOpen}
              />
            </RecipientAddressContainer>

            <RecipientInputContainer $isOpen={isRecipientAddressInputOpen}>
              <Input
                label="Recipient"
                name="recipientAddress"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder={!isLoggedIn ? 'Wallet disconnected' : 'Recipient address'}
                readOnly={!isLoggedIn}
              />
            </RecipientInputContainer>

            <HorizontalDivider/>

            <TargetedLiquidityContainer>
              <ItemLabel>
                Targeted liquidity
                <ItemDescription>
                  {commonStrings.get('TARGETED_LIQUIDITY_DESCRIPTION')}
                </ItemDescription>
              </ItemLabel>

              <SwitchContainer>
                <Switch
                  checked={isTargetedLiquidityEnabled}
                  onChange={navigateToLiquidityHandler}
                />
              </SwitchContainer>
            </TargetedLiquidityContainer>
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
  z-index: 10;
`;

const Dropdown = styled.div`
  display: flex;
  width: 392px;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0E111C;
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
  font-size: 16px;
  padding-bottom: 1rem;
`;

interface StyledChevronDownProps {
  $isOpen?: boolean;
}

const StyledChevronDown = styled(ChevronDown)<StyledChevronDownProps>`
  width: 20px;
  height: 20px;
  color: #CED4DA;

  transition: transform 0.4s;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

interface RecipientAddressContainerProps {
  $isOpen?: boolean;
}

const RecipientInputContainer = styled.div<RecipientAddressContainerProps>`
  max-height: ${({ $isOpen }) => $isOpen ? '42px' : '0px'};
  transition: max-height 0.3s ease-out;
  overflow: hidden;

  ${({ $isOpen }) => $isOpen && `
    padding-bottom: 1rem;
  `}
`;

const HorizontalDivider = styled.div`
  width: 100%;
  border-top: 1px solid #98a1c03d;
`;

const TargetedLiquidityContainer = styled.div`
  display: grid;
  grid-template-columns: .8fr .2fr;
  align-items: center;
  font-size: 16px;
  padding-top: 1rem;
`;

const SwitchContainer = styled.div`
  justify-self: end;
`;

const ItemLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  line-height: 1.5;
`;

const ItemDescription = styled.div`
  font-size: 14px;
  color: #6C757D;
`;