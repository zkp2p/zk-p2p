import React from "react";
import styled from 'styled-components';


interface TokenRowProps {
  receiveTokenName: string;
  receiveTokenSymbol: string;
  isSelected: boolean;
  tokenSvg: string;
  onRowClick: () => void;
}

export const TokenRow: React.FC<TokenRowProps> = ({
  receiveTokenName,
  receiveTokenSymbol,
  isSelected,
  tokenSvg,
  onRowClick,
}: TokenRowProps) => {
  TokenRow.displayName = "TokenRow";

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
    >
      <DetailsContainer>
        <TokenSvg src={tokenSvg} />
        <TokenNameAndSymbolContainer>
          <TokenNameLabel>{receiveTokenName}</TokenNameLabel>
          <TokenSymbolLabel>{receiveTokenSymbol}</TokenSymbolLabel>
        </TokenNameAndSymbolContainer>
      </DetailsContainer>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: 12px 24px 12px 20px;

  ${({ selected }) => selected && `
    background-color: #191D28;
    box-shadow: none;
  `}

  ${({ selected }) => !selected && `
    &:hover {
      background-color: #191D28;
      box-shadow: none;
    }
  `}
`;

const DetailsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
`;

const TokenNameAndSymbolContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`;

const TokenNameLabel = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 2px;
  color: #FFFFFF;
`;

const TokenSymbolLabel = styled.div`
  padding-top: 4px;
  color: #FFFFFF;
`;

const TokenSvg = styled.img`
  border-radius: 18px;
  width: 36px;
  height: 36px;
`;
