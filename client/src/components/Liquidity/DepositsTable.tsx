import React, { useEffect, useState } from 'react';
import { Link } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { Button } from "../Button";
import { DepositWithAvailableLiquidity } from "../../contexts/venmo/Deposits/types";
import { PaymentPlatformType, PaymentPlatform } from '../../contexts/common/PlatformSettings/types';
import { DepositsRow } from "./DepositsRow";
import { toUsdcString, conversionRateToString } from '@helpers/units'

import useVenmoLiquidity from '@hooks/useLiquidity';
import useHdfcLiquidity from '@hooks/hdfc/useHdfcLiquidity';


const ROWS_PER_PAGE = 10;

export interface DepositPrime {
  platformType: PaymentPlatformType,
  depositor: string;
  depositId: bigint;
  availableDepositAmount: string;
  totalDepositAmount: string;
  conversionRate: string;
  targeted: boolean;
}

export const DepositsTable: React.FC = () => {
  /*
   * Contexts
   */

  const {
    depositStore: venmoDepositStore,
    targetedDepositIds: venmoTargetedDepositIds,
    setTargetedDepositIds: setVenmoTargetedDepositIds
  } = useVenmoLiquidity();

  const {
    depositStore: hdfcDepositStore,
    targetedDepositIds: hdfcTargetedDepositIds,
    setTargetedDepositIds: setHdfcTargetedDepositIds
  } = useHdfcLiquidity();

  /*
   * State
   */

  const [positionsRowData, setPositionsRowData] = useState<DepositPrime[]>([]);
  const [combinedDepositStore, setCombinedDepositStore] = useState<DepositWithAvailableLiquidity[]>([]);

  const [currentPage, setCurrentPage] = useState(0);

  const [isTargetingDeposits, setIsTargetingDeposits] = useState<boolean>(false);

  /*
   * Hooks
   */

  useEffect(() => {
    if (venmoDepositStore && hdfcDepositStore) {
      const combinedDepositStore = [...venmoDepositStore, ...hdfcDepositStore];

      setCombinedDepositStore(combinedDepositStore);
    } else if (venmoDepositStore) {
      setCombinedDepositStore(venmoDepositStore);
    } else if (hdfcDepositStore) {
      setCombinedDepositStore(hdfcDepositStore);
    }
  }, [venmoDepositStore, hdfcDepositStore]);

  useEffect(() => {
    if (combinedDepositStore.length === 0) {
      setPositionsRowData([]);  
    } else {
      var sanitizedDeposits: DepositPrime[] = [];
      sanitizedDeposits = combinedDepositStore.map((depositWithLiquidity: DepositWithAvailableLiquidity) => {
        const deposit = depositWithLiquidity.deposit
        const platformType = deposit.platformType
        const depositor = deposit.depositor;
        const depositId = depositWithLiquidity.depositId;
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity, true);
        const totalDepositAmount = toUsdcString(deposit.depositAmount, true);
        const conversionRate = conversionRateToString(deposit.conversionRate);

        let targeted = false;
        if (platformType === PaymentPlatform.VENMO && venmoTargetedDepositIds) {
          const targetedDepositIdsSet = new Set(venmoTargetedDepositIds.map(id => id.toString()));

          if (targetedDepositIdsSet.has(depositWithLiquidity.depositId.toString())) {
            targeted = true;
          }
        } else if (platformType === PaymentPlatform.HDFC && hdfcTargetedDepositIds) {
          const targetedDepositIdsSet = new Set(hdfcTargetedDepositIds.map(id => id.toString()));

          if (targetedDepositIdsSet.has(depositWithLiquidity.depositId.toString())) {
            targeted = true;
          }
        }

        return {
          depositor,
          platformType,
          depositId,
          availableDepositAmount,
          totalDepositAmount,
          conversionRate,
          targeted
        };
      });

      setPositionsRowData(sanitizedDeposits);
    }
  }, [
    combinedDepositStore,
    isTargetingDeposits,
    venmoTargetedDepositIds,
    hdfcTargetedDepositIds,
  ]);

  useEffect(() => {
    setCurrentPage(0);
  }, [positionsRowData.length]);

  /*
   * Handlers
   */

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleClickTargetDeposits = () => {
    if (isTargetingDeposits) {
      setIsTargetingDeposits(false);
    } else {
      setIsTargetingDeposits(true);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, depositId: bigint, isVenmo: boolean) => {
    if (isVenmo) {
      if (venmoTargetedDepositIds) {
        const didSelectDeposit = event.target.checked;
        if (didSelectDeposit) {
          const depositIdsToStore = [...venmoTargetedDepositIds, depositId];
  
          setVenmoTargetedDepositIds(depositIdsToStore);
        } else {
          const filteredTargetedDepositIds = venmoTargetedDepositIds.filter(id => id !== depositId);
  
          setVenmoTargetedDepositIds(filteredTargetedDepositIds);
        }
      }
    } else {
      if (hdfcTargetedDepositIds) {
        const didSelectDeposit = event.target.checked;
        if (didSelectDeposit) {
          const depositIdsToStore = [...hdfcTargetedDepositIds, depositId];
  
          setHdfcTargetedDepositIds(depositIdsToStore);
        } else {
          const filteredTargetedDepositIds = hdfcTargetedDepositIds.filter(id => id !== depositId);
  
          setHdfcTargetedDepositIds(filteredTargetedDepositIds);
        }
      }
    }
};

  /*
   * Helpers
   */

  const totalPages = Math.ceil(positionsRowData.length / ROWS_PER_PAGE);

  const paginatedData = positionsRowData.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE);

  const targetDepositsButtonText = isTargetingDeposits ? 'Save Selections' : '+ Target Deposits';
  
  /*
   * Component
   */

  return (
    <>
      <TitleRow>
        <ThemedText.HeadlineMedium>
          Liquidity
        </ThemedText.HeadlineMedium>

        <Button onClick={handleClickTargetDeposits} height={40}>
          {targetDepositsButtonText}
        </Button>
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

              <ColumnHeader>Platform</ColumnHeader>

              <ColumnHeader>Depositor</ColumnHeader>

              <ColumnHeader>Available Amount</ColumnHeader>

              <ColumnHeader>Conversion Rate</ColumnHeader>

              <ColumnHeader>Targeted</ColumnHeader>
            </TableHeaderRow>
            <Table>
              {paginatedData.map((positionRow, rowIndex) => (
                <PositionRowStyled key={rowIndex}>
                  <DepositsRow
                    isVenmo={positionRow.platformType === PaymentPlatform.VENMO}
                    availableDepositAmount={positionRow.availableDepositAmount}
                    conversionRate={positionRow.conversionRate}
                    depositorAddress={positionRow.depositor}
                    rowIndex={rowIndex}
                    targeted={positionRow.targeted}
                    isSelectingDeposits={isTargetingDeposits}
                    depositId={positionRow.depositId}
                    handleTargetLiquidityCheckboxChange={handleCheckboxChange}
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
  padding: 36px;
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
  grid-template-columns: .2fr .9fr .6fr .8fr repeat(2, minmax(0,1fr)) .4fr;
  gap: 8px;
  text-align: left;
  padding: 1.3rem 1.75rem 1rem 1.75rem;
  border-bottom: 1px solid #98a1c03d;

  & > *:last-child {
    justify-self: center;
  }
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
