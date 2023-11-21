import React, { useEffect, useState } from 'react';
import { Link } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { DepositWithAvailableLiquidity } from "../../contexts/Deposits/types";
import { DepositsRow } from "./DepositsRow";
import { toUsdcString, conversionRateToString } from '@helpers/units'
import useLiquidity from '@hooks/useLiquidity';


const ROWS_PER_PAGE = 5;

export interface DepositPrime {
  depositor: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  conversionRate: string;
}

export const DepositsTable: React.FC = () => {
  /*
   * Contexts
   */

  const { depositStore } = useLiquidity();

  /*
   * State
   */

  const [positionsRowData, setPositionsRowData] = useState<DepositPrime[]>([]);

  const [currentPage, setCurrentPage] = useState(0);

  /*
   * Hooks
   */

  useEffect(() => {
    if (!depositStore) {
      setPositionsRowData([]);  
    } else {
      var sanitizedPositions: DepositPrime[] = [];
      sanitizedPositions = depositStore.map((depositWithLiquidity: DepositWithAvailableLiquidity) => {
        const deposit = depositWithLiquidity.deposit

        const depositor = deposit.depositor;
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity);
        const totalDepositAmount = toUsdcString(deposit.depositAmount);
        const conversionRate = conversionRateToString(deposit.conversionRate, true);

        return {
          depositor,
          availableDepositAmount,
          totalDepositAmount,
          conversionRate
        };
      });

      setPositionsRowData(sanitizedPositions);
    }
  }, [depositStore]);

  useEffect(() => {
    setCurrentPage(0);
  }, [positionsRowData.length]);

  /*
   * Handlers
   */

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  /*
   * Helpers
   */

  const totalPages = Math.ceil(positionsRowData.length / ROWS_PER_PAGE);

  const paginatedData = positionsRowData.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE);
  
  /*
   * Component
   */

  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Liquidity
          </ThemedText.HeadlineMedium>
        </TitleRow>

        <Content>
          {positionsRowData.length === 0 ? (
            <ErrorContainer>
              <ThemedText.DeprecatedBody textAlign="center">
                <ChainLinkIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                <div>
                  Fetching all active deposits.
                </div>
              </ThemedText.DeprecatedBody>
            </ErrorContainer>
          ) : (
            <PositionsContainer>
              <PositionCountTitle>
                <ThemedText.LabelSmall textAlign="left">
                  Active global deposits
                </ThemedText.LabelSmall>
              </PositionCountTitle>
              <Table>
                {paginatedData.map((positionRow, rowIndex) => (
                  <PositionRowStyled key={rowIndex}>
                    <DepositsRow
                      availableDepositAmount={positionRow.availableDepositAmount}
                      totalDepositAmount={positionRow.totalDepositAmount}
                      conversionRate={positionRow.conversionRate}
                      depositorAddress={positionRow.depositor}
                      rowIndex={rowIndex}
                    />
                  </PositionRowStyled>
                ))}
              </Table>
            </PositionsContainer>
          )}
        </Content>

        {positionsRowData.length > ROWS_PER_PAGE && (
          <PaginationContainer>
            <PaginationButton disabled={currentPage === 0} onClick={() => handleChangePage(currentPage - 1)}>
              &#8249;
            </PaginationButton>
            <PageInfo>
              {totalPages === 0 ? '0 of 0' : `${currentPage + 1} of ${totalPages}`}
            </PageInfo>
            <PaginationButton
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              onClick={() => handleChangePage(currentPage + 1)}>  
              &#8250;
            </PaginationButton>
          </PaginationContainer>
        )}
      </Column>
    </Container>
  )
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const TitleRow = styled(RowBetween)`
  margin-bottom: 20px;
  height: 50px;
  align-items: flex-end;
  color: #FFF;
  padding: 0 1rem;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  };
`;

const Content = styled.main`
  display: flex;
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  overflow: hidden;
`;

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: 36px 0px;
  max-width: 340px;
  min-height: 25vh;
  gap: 36px;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const ChainLinkIcon = styled(Link)`
  ${IconStyle}
`;

const PositionsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`;

const PositionCountTitle = styled.div`
  width: 100%;
  text-align: left;
  padding-top: 1.25rem;
  padding-bottom: 1rem;
  padding-left: 1.5rem;
  border-bottom: 1px solid #98a1c03d;
`;

const Table = styled.div`
  width: 100%;
  border-radius: 8px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.25);
  font-size: 16px;
  color: #616161;

  & > * {
    border-bottom: 1px solid #98a1c03d;
  }

  & > *:last-child {
    border-bottom: none;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const PaginationButton = styled.button`
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 16px;
  margin: 0 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.2);
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: rgba(255, 255, 255, 0.8);
  word-spacing: 2px;
  font-size: 16px;
`;

const PositionRowStyled = styled.div`
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;
