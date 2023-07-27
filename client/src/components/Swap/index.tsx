
import { Inbox } from 'react-feather'
import styled, { css, useTheme } from 'styled-components/macro'

import { Button } from '../Button'
import { AutoColumn } from '../layouts/Column'
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'


export default function SwapModal() {
  return (
      <ComponentWrapper>
        <TopArea>
          <Title>Token</Title>
        </TopArea>
        <FromArea>
          <TopItem>
            {/* Replace o-tooltip with an equivalent React component or library */}
            <Left>From</Left>
            {/* Replace CommLoading with an equivalent React component or library */}
            <Right>{/* Replace with fromBalance state variable */}</Right>
          </TopItem>
          <BottomItem>
            <Left>
              {/* Replace svg-icon with an equivalent React component or library */}
              {/* Replace with showChainName() method */}
              {/* Replace SvgIconThemed with an equivalent React component or library */}
            </Left>
            <Right>
              <input
                type="text"
                placeholder={'0.0'}
              />
              {/* Replace el-button with an equivalent React component or library */}
              {/* Replace ObSelect with an equivalent React component or library */}
            </Right>
          </BottomItem>
        </FromArea>
      </ComponentWrapper>
  )
}

const ComponentWrapper = styled.div`
  max-width: 480px;
  width: 100%;
  padding: 1.5rem;
  border-radius: 20px;
  background: #0D111C;
`

const TopArea = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const Title = styled.span`
  font-weight: 700;
  font-size: 20px;
  line-height: 20px;
  margin-right: 10px;
`;

// FromArea, TopItem, and BottomItem
const FromArea = styled.div`
  margin-top: 20px;
  height: 96px;
  border-radius: 20px;
  position: relative;
  padding: 20px;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
`;

const TopItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BottomItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  align-items: center;
`;

// Left and Right
const Left = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const Right = styled.div`
  width: 100%;
  text-align: right;
  border: 0;
  outline: 0;
  appearance: none;
  background-color: transparent;
  transition: all 0.2s ease 0s;
  flex-direction: row-reverse;
`;
