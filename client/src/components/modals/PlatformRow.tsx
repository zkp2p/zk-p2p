import React from "react";
import styled from 'styled-components';


interface PlatformRowProps {
  platformName: string;
  platformCurrency: string;
  isSelected: boolean;
  isLastRow: boolean;
  flagSvg: string;
  onRowClick: () => void;
}

export const PlatformRow: React.FC<PlatformRowProps> = ({
  platformName,
  platformCurrency,
  isSelected,
  isLastRow,
  flagSvg,
  onRowClick,
}: PlatformRowProps) => {
  PlatformRow.displayName = "PlatformRow";

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
      isLastRow={isLastRow}
    >
      <DetailsContainer>
        <FlagSvg src={flagSvg} />
        <PlatformAndCurrencyLabel>
          <PlatformLabel>{platformName}</PlatformLabel>
          <CurrencyLabel>{platformCurrency}</CurrencyLabel>
        </PlatformAndCurrencyLabel>
      </DetailsContainer>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean; isLastRow: boolean }>`
  display: flex;
  flex-direction: row;
  height: 100%;
  border-radius: ${({ isLastRow }) => isLastRow ? "0 0 8px 8px" : "0"};
  padding: 12px 24px 12px 20px;

  ${({ selected }) => selected && `
    background-color: #191D28;
    box-shadow: none;
  `}

  ${({ selected, isLastRow }) => !selected && `
    &:hover {
      background-color: #191D28;
      border-radius: ${isLastRow ? "0 0 8px 8px" : "0"};
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

const CurrencyLabel = styled.div`
  padding-top: 4px;
  color: #FFFFFF;
`;

const FlagSvg = styled.img`
  width: 36px;
  height: 36px;
`;