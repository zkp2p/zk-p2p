import React, { useEffect, useState } from 'react';
import { Link } from 'react-feather';
import styled, { css } from 'styled-components/macro';
import { useNavigate } from 'react-router-dom';

import { RowBetween } from '@components/layouts/Row';
import { DepositsRow } from "@components/Liquidity/DepositsRow";
import { PlatformSelector } from '@components/modals/PlatformSelector';
import { PaymentPlatformType, PaymentPlatform, DepositWithAvailableLiquidity, paymentPlatformInfo } from '@helpers/types';
import { toUsdcString, conversionRateToMultiplierString } from '@helpers/units';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';

import useVenmoLiquidity from '@hooks/venmo/useLiquidity';
import useHdfcLiquidity from '@hooks/hdfc/useLiquidity';
import useGarantiLiquidity from '@hooks/garanti/useLiquidity';
import useWiseLiquidity from '@hooks/wise/useLiquidity';
import useAccount from '@hooks/useAccount';
import usePlatformSettings from '@hooks/usePlatformSettings';


const ROWS_PER_PAGE = 10;

export interface DepositPrime {
  platformType: PaymentPlatformType,
  depositor: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  conversionRate: string;
  conversionCurrency: string;
}

export const DepositsTable: React.FC = () => {
  const navigate = useNavigate();

  /*
   * Contexts
   */

  const {
    depositStore: venmoDepositStore,
  } = useVenmoLiquidity();

  const {
    depositStore: hdfcDepositStore,
  } = useHdfcLiquidity();

  const {
    depositStore: garantiDepositStore,
  } = useGarantiLiquidity();

  const {
    depositStore: wiseDepositStore,
  } = useWiseLiquidity();

  const {
    isLoggedIn
  } = useAccount();

  const {
    paymentPlatform
  } = usePlatformSettings();

  /*
   * State
   */

  const [positionsRowData, setPositionsRowData] = useState<DepositPrime[]>([]);

  const [currentPage, setCurrentPage] = useState(0);

  /*
   * Hooks
   */

  useEffect(() => {
    let depositStoreToDisplay: DepositWithAvailableLiquidity[] = [];
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        depositStoreToDisplay = venmoDepositStore ?? [];
        break;

      case PaymentPlatform.HDFC:
        depositStoreToDisplay = hdfcDepositStore ?? [];
        break;

      case PaymentPlatform.GARANTI:
        depositStoreToDisplay = garantiDepositStore ?? [];
        break;

      case PaymentPlatform.WISE:
        depositStoreToDisplay = wiseDepositStore ?? [];
        break;

      default:
        break;
    }

    if (depositStoreToDisplay.length === 0) {
      setPositionsRowData([]);  
    } else {
      var sanitizedDeposits: DepositPrime[] = [];
      sanitizedDeposits = depositStoreToDisplay.map((depositWithLiquidity: DepositWithAvailableLiquidity) => {
        const deposit = depositWithLiquidity.deposit
        const platformType = deposit.platformType
        const depositor = deposit.depositor;
        const availableDepositAmount = toUsdcString(depositWithLiquidity.availableLiquidity, true);
        const totalDepositAmount = toUsdcString(deposit.depositAmount, true);
        const conversionRate = conversionRateToMultiplierString(deposit.conversionRate);
        const conversionCurrency = paymentPlatformInfo[deposit.platformType].platformCurrency;

        return {
          depositor,
          platformType,
          availableDepositAmount,
          totalDepositAmount,
          conversionRate,
          conversionCurrency
        };
      });

      setPositionsRowData(sanitizedDeposits);
    }
  }, [
    venmoDepositStore,
    hdfcDepositStore,
    garantiDepositStore,
    paymentPlatform,
    wiseDepositStore
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
        <PlatformSelector />
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
            </TableHeaderRow>
            <Table>
              {paginatedData.map((positionRow, rowIndex) => (
                <PositionRowStyled key={rowIndex}>
                  <DepositsRow
                    paymentPlatform={positionRow.platformType}
                    availableDepositAmount={positionRow.availableDepositAmount}
                    conversionRate={positionRow.conversionRate}
                    conversionCurrency={positionRow.conversionCurrency}
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
  background-color: ${colors.container};
  border: 1px solid ${colors.defaultBorderColor};
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
  grid-template-columns: .2fr .9fr .6fr 1.1fr repeat(2, minmax(0,1fr));
  gap: 8px;
  text-align: left;
  padding: 1.3rem 1.75rem 1rem 1.75rem;
  border-bottom: 1px solid ${colors.defaultBorderColor};
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
    border-bottom: 1px solid ${colors.defaultBorderColor};
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
