import { ReactNode, useCallback, useState } from 'react';
import { HelpCircle } from 'react-feather';
import styled from 'styled-components/macro';

import Tooltip from '@components/common/Tooltip';


export default function QuestionHelper({ text, size = 'sm' }: { text: ReactNode; size?: 'sm' | 'medium' }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip text={text} show={show}>
      <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} size={size}>
        <QuestionMark size={size}>
          <HelpCircle size={size === 'sm' ? 16 : 22} />
        </QuestionMark>
      </QuestionWrapper>
    </Tooltip>
  )
}

const QuestionWrapper = styled.div<{ size: 'sm' | 'medium' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  width: ${({ size }) => (size === 'sm' ? '18px' : '24px')};
  height: ${({ size }) => (size === 'sm' ? '18px' : '24px')};
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: ${({ size }) => (size === 'sm' ? '36px' : '42px')};
  font-size: ${({ size }) => (size === 'sm' ? '12px' : '16px')};

  :hover,
  :focus {
    opacity: 0.7;
  }
`;

const QuestionMark = styled.span<{ size: 'sm' | 'medium' }>`
  display: flex;
  font-size: ${({ size }) => (size === 'sm' ? '14px' : '16px')};
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSecondary};
`;
