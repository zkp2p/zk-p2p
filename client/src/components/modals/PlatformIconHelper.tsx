import { useCallback, useState } from 'react';
import { Mail, Globe } from 'react-feather';
import styled from 'styled-components/macro';

import Tooltip from '@components/common/Tooltip';
import { commonStrings } from '@helpers/strings';


export default function PlatformIconHelper({ keyType }: { keyType: 'mail' | 'browser'; }) {
  /*
   * State
   */

  const [show, setShow] = useState<boolean>(false)

  /*
   * Handlers
   */

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  /*
   * Helpers
   */

  const getTextForType = (key: 'mail' | 'browser'): string => {
    switch (key) {
      case 'mail':
        return commonStrings.get('PLATFORM_INSTRUCTIONS_MAIL_TOOLTIP');

      case 'browser':
        return commonStrings.get('PLATFORM_INSTRUCTIONS_BROWSER_TOOLTIP');

      default:
        return 'Invalid platform type';
    }
  };

  const getIconForType = (key: 'mail' | 'browser'): JSX.Element => {
    switch (key) {
      case 'mail':
        return <Mail size={22} />;
      case 'browser':
        return <Globe size={22} />;
      default:
        return <div>Invalid Icon</div>;
    }
  };
  
  return (
    <Tooltip text={getTextForType(keyType)} show={show}>
      <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
        <QuestionMark>
          {getIconForType(keyType)}
        </QuestionMark>
      </QuestionWrapper>
    </Tooltip>
  );
};

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  font-size: 16px;

  :hover,
  :focus {
    opacity: 0.7;
  }
`;

const QuestionMark = styled.span`
  display: flex;
  font-size: 16px;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSecondary};
`;
