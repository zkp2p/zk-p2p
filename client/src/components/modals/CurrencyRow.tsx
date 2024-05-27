import React from "react";
import styled from 'styled-components';


interface CurrencyRowProps {
  platformCurrency: string;
  isSelected: boolean;
  flagSvg: string;
  onRowClick: () => void;
}

export const CurrencyRow: React.FC<CurrencyRowProps> = ({
  platformCurrency,
  isSelected,
  flagSvg,
  onRowClick,
}: CurrencyRowProps) => {
  CurrencyRow.displayName = "CurrencyRow";

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
    >
      <DetailsContainer>
        <FlagSvg src={flagSvg} />
        <PlatformAndCurrencyLabel>
          <PlatformLabel>{platformCurrency}</PlatformLabel>
        </PlatformAndCurrencyLabel>
      </DetailsContainer>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  height: 54px;
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

const PlatformAndCurrencyLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`;

const PlatformLabel = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 2px;
  color: #FFFFFF;
`;

const FlagSvg = styled.img`
  width: 36px;
  height: 36px;
`;