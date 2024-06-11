import React from "react";
import styled from 'styled-components';

import { colors } from "@theme/colors";
import PlatformIconHelper from '@components/modals/PlatformIconHelper';


interface PlatformRowProps {
  platformName: string;
  platformCurrencies: string[];
  isSelected: boolean;
  onRowClick: () => void;
}

export const PlatformRow: React.FC<PlatformRowProps> = ({
  platformName,
  platformCurrencies,
  isSelected,
  onRowClick,
}: PlatformRowProps) => {
  PlatformRow.displayName = "PlatformRow";

  const platformIconHelperToRender = (platformName: string) => {
    switch (platformName) {
      case 'Revolut':
        return <PlatformIconHelper keyType={'browser'} />;

      case 'mail':
      default:
        return <PlatformIconHelper keyType={'mail'} />;
    }
  };

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
    >
      <DetailsContainer>
        {platformIconHelperToRender(platformName)}
        <PlatformAndCurrencyLabel>
          <PlatformLabel>{platformName}</PlatformLabel>
          <CurrencyLabel>{platformCurrencies.map((currency) => currency).join(', ')}</CurrencyLabel>
        </PlatformAndCurrencyLabel>
      </DetailsContainer>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  min-height: 54px;
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
  flex-wrap: wrap;
`;

const PlatformLabel = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 2px;
  color: #FFFFFF;
`;

const CurrencyLabel = styled.div`
  padding-top: 4px;
  color: ${colors.offWhite};

  @media (max-width: 600px) {
    white-space: normal;
    overflow: hidden;
    text-align: right;
    min-width: 0;
    flex: 1 1 auto;
    max-width: 100px;
  }
`;