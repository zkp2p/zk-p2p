import React, { useEffect, useState } from 'react';
import { Link } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { DepositWithAvailableLiquidity } from "../../contexts/Deposits/types";
import { DepositsRow } from "./DepositsRow";
import { toUsdcString, conversionRateToString } from '@helpers/units'
import useLiquidity from '@hooks/useLiquidity';


const ROWS_PER_PAGE = 10;

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
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity, true);
        const totalDepositAmount = toUsdcString(deposit.depositAmount, true);
        const conversionRate = conversionRateToString(deposit.conversionRate);

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
    <>
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
            <TableContainer>
              <TableHeaderRow>
                <ColumnHeader>#</ColumnHeader>

                <ColumnHeader>Token</ColumnHeader>

                <ColumnHeader>Depositor</ColumnHeader>

                <ColumnHeader>Available Amount</ColumnHeader>

                <ColumnHeader>Conversion Rate</ColumnHeader>

                <ColumnHeader>Deposit Amount</ColumnHeader>
              </TableHeaderRow>
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
            </TableContainer>
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
    </>
  )
};

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
  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
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

const TableContainer = styled.div`
  display: block;
`;

const TableHeaderRow = styled.div`
  display: grid;
  grid-template-columns: .2fr repeat(5, minmax(0,1fr));
  gap: 8px;
  text-align: left;
  padding: 1.3rem 1.75rem 1rem 1.75rem;
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


const ColumnHeader = styled.div`
  text-align: left;
  font-size: 14px;
  opacity: 0.7;
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
