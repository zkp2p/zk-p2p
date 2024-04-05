import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { Zap, UserX, UserCheck } from 'react-feather';
import Link from '@mui/material/Link';
import { isChrome, isFirefox, isChromium } from 'react-device-detect';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { NotarizationRow } from '@components/Notary/NotarizationRow';
import {
  // ExtensionEventMessage,
  ExtensionNotaryProofRequest,
  ExtensionNotaryProofRow
} from '@hooks/useBrowserExtension';
import {
  NotaryProofInputStatus,
  NotaryVerificationCircuitType,
  NotaryVerificationCircuit,
  PaymentPlatformType
} from '@helpers/types';
import { commonStrings, platformStrings } from "@helpers/strings";
import useExtensionNotarizations from '@hooks/useExtensionNotarizations';

import chromeSvg from '../../assets/images/browsers/chrome.svg';
import braveSvg from '../../assets/images/browsers/brave.svg';
import firefoxSvg from '../../assets/images/browsers/firefox.svg';


const ROWS_PER_PAGE = 3;
const VERSION_REFETCH_INTERVAL = 5000;
// const BROWSER_EXTENSION_ID = 'onkppmjkpbfbfbjoecignlobdpcbnkbg';

const USE_WISE_DEFAULT_DEPOSITOR = process.env.USE_WISE_DEFAULT_DEPOSITOR;
const WISE_DEFAULT_DEPOSITOR_REGISTRATION_PROOF = process.env.WISE_DEFAULT_DEPOSITOR_REGISTRATION_PROOF;
const WISE_DEFAULT_DEPOSITOR_MC_ID_PROOF = process.env.WISE_DEFAULT_DEPOSITOR_MC_ID_PROOF;

interface NotarizationTableProps {
  paymentPlatform: PaymentPlatformType;
  circuitType: NotaryVerificationCircuitType;
  setNotaryProof: (notarization: string) => void;
  handleVerifyNotaryProofClicked: () => void;
  notaryProofSelectionStatus: string;
  isProofModalOpen: boolean;
};

export const NotarizationTable: React.FC<NotarizationTableProps> = ({
  paymentPlatform,
  circuitType,
  setNotaryProof,
  handleVerifyNotaryProofClicked,
  notaryProofSelectionStatus,
  isProofModalOpen
}) => {
  /*
   * Context
   */

  const {
    refetchExtensionVersion,
    refetchProfileRequests,
    refetchTransferRequests,
    isSidebarInstalled,
    profileProofs,
    transferProofs
  } = useExtensionNotarizations();

  /*
   * State
   */

  const [browser, setBrowser] = useState<string>("");

  const [loadedNotaryProofs, setLoadedNotaryProofs] = useState<ExtensionNotaryProofRow[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

  const [isShowingTable, setIsShowingTable] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(0);

  /*
   * Handlers
   */

  const handleInstallExtensionClicked = () => {
    alert('This will link to extension download page');
  };

  const handleRowClick = (index: number) => {
    setSelectedIndex(index);

    const notarization = loadedNotaryProofs[index];
    
    setNotaryProof(notarization.proof);
  };

  const handleToggleNotarizationTablePressed = () => {
    setIsShowingTable(!isShowingTable);
  };

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  /*
   * Helpers
   */

  const detectedNotarizationCopy = () => {
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        return {
          detected_copy: 'The following tag was detected from your Wise account',
          metadata_copy: '[Wise Tag]',
          metadata_type_copy: 'tag',
          transaction_type_copy: 'registration'
        };

      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
        return {
          detected_copy: 'The following profile was detected from your Wise account',
          metadata_copy: '[MC ID]',
          metadata_type_copy: 'profile id',
          transaction_type_copy: 'depositor registration'
          };

      case NotaryVerificationCircuit.TRANSFER:
        return {
          detected_copy: 'The following transaction was detected from your Wise account history',
          metadata_copy: '[Transfer to X for Y]',
          metadata_type_copy: 'transaction',
          transaction_type_copy: 'order'
        };

      default:
        return {
          detected_copy: '',
          metadata_copy: '',
          metadata_type_copy: '',
          transaction_type_copy: ''
        };
    }
  };

  const noNotarizationsErrorString = () => {
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        return platformStrings.getForPlatform(paymentPlatform, 'NO_NOTARIZATIONS_ERROR');

      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
      case NotaryVerificationCircuit.TRANSFER:
        return platformStrings.getForPlatform(paymentPlatform, 'NO_TRANSFER_NOTARIZATIONS_ERROR');

      default:
        return '';
    }
  };

  async function getBrowser() {
    if (isFirefox) {
      return "firefox";
    } else if (isChrome) {
      return "chrome";
    } else if (isChromium) {
      return "brave";
    };

    return "unknown";
  };

  const notarizationToggleCta = () => {
    if (isShowingTable) {
      return 'Go back';
    } else {
      return 'See all tags';
    }
  };

  const browserSvg = () => {
    switch (browser) {
      case 'firefox':
        return firefoxSvg;

      case 'brave':
        return braveSvg;

      case 'chrome':
        return chromeSvg;

      default:
        return chromeSvg;
    }
  };

  const addToBrowserCopy = () => {
    switch (browser) {
      case 'firefox':
        return 'Add to Firefox';

      case 'brave':
        return 'Add to Brave';

      case 'chrome':
        return 'Add to Chrome';

      default:
        return 'Add to browser';
    }
  };

  function formatDateTime(unixTimestamp: string): string {
    const date = new Date(Number(unixTimestamp));
    const now = new Date();

    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      switch (paymentPlatform) {
        default:
          return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
          });
      }
    }
  };

  const rowSubjectText = (notaryProof: ExtensionNotaryProofRow) => {
    return notaryProof.metadata;
  };

  const totalPages = Math.ceil(loadedNotaryProofs.length / ROWS_PER_PAGE);

  const paginatedData = loadedNotaryProofs.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE);

  async function fetchData() {
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        refetchProfileRequests();
        break;

      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
      case NotaryVerificationCircuit.TRANSFER:
        refetchTransferRequests();
        break;

      default:
        break;
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    async function detectBrowser() {
      setBrowser(await getBrowser());
    }

    detectBrowser();

    // Moot to run this on an interval because the content script needs to be injected
    refetchExtensionVersion();
  }, []);

  useEffect(() => {
    if (!isSidebarInstalled) {
      return;
    }
  
    let intervalId: NodeJS.Timeout | null = null;
  
    const setupInterval = (callback: () => void) => {
      callback();
  
      if (intervalId) {
        clearInterval(intervalId);
      };
      
      intervalId = setInterval(callback, VERSION_REFETCH_INTERVAL);
    };
  
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        setupInterval(refetchProfileRequests);
        break;
  
      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
      case NotaryVerificationCircuit.TRANSFER:
        setupInterval(refetchTransferRequests);
        break;
  
      default:
        break;
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuitType, isSidebarInstalled]);

  useEffect(() => {
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        let defaultDepositorProof: (ExtensionNotaryProofRow | null) = null;
        if (USE_WISE_DEFAULT_DEPOSITOR === 'true') {
          defaultDepositorProof = {
            proof: WISE_DEFAULT_DEPOSITOR_REGISTRATION_PROOF,
            metadata: '[HARD_CODED] richardl3291',
            date: '1710571636'
          } as ExtensionNotaryProofRow;
        }
        
        let allAccountProofRows = defaultDepositorProof ? [defaultDepositorProof] : [];
        if (profileProofs && profileProofs.length > 0) {
          const fetchedProfileProofRows = profileProofs.map((request: ExtensionNotaryProofRequest) => {
            return {
              proof: JSON.stringify(request.proof),
              metadata: request.url,
              date: '1710571636'
            } as ExtensionNotaryProofRow;
          });
    
          setLoadedNotaryProofs(allAccountProofRows.concat(fetchedProfileProofRows));
        } else {
          setLoadedNotaryProofs(allAccountProofRows);
        }
        break;

      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
        let defaultDepositorTransferProof: (ExtensionNotaryProofRow | null) = null;
        if (USE_WISE_DEFAULT_DEPOSITOR === 'true') {
          defaultDepositorTransferProof = {
            proof: WISE_DEFAULT_DEPOSITOR_MC_ID_PROOF,
            metadata: '[HARD_CODED] richardl3291 (mc_id)',
            date: '1710571636'
          } as ExtensionNotaryProofRow;
        }

        let allTransferProofRows = defaultDepositorTransferProof ? [defaultDepositorTransferProof] : [];
        if (transferProofs && transferProofs.length > 0) {
          const fetchedTransferProofRows = transferProofs.map((request: ExtensionNotaryProofRequest) => {
            return {
              proof: JSON.stringify(request.proof),
              metadata: request.url,
              date: '1710571636'
            } as ExtensionNotaryProofRow;
          });
    
          setLoadedNotaryProofs(allTransferProofRows.concat(fetchedTransferProofRows));
        } else {
          setLoadedNotaryProofs(allTransferProofRows);
        }
        break;

      case NotaryVerificationCircuit.TRANSFER:
        if (transferProofs && transferProofs.length > 0) {
          const transferProofRows = transferProofs.map((request: ExtensionNotaryProofRequest) => {
            return {
              proof: JSON.stringify(request.proof),
              metadata: request.url,
              date: '1710571636'
            } as ExtensionNotaryProofRow;
          });
    
          setLoadedNotaryProofs(transferProofRows);
        } else {
          setLoadedNotaryProofs([]);
        }
        break;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuitType, profileProofs, transferProofs]);

  useEffect(() => {
    if (loadedNotaryProofs.length > 0) {
      const firstAccountNotarization = loadedNotaryProofs[0];

      setSelectedIndex(0);
      setNotaryProof(firstAccountNotarization.proof);
    } else {
      setSelectedIndex(null);
      setNotaryProof('');
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedNotaryProofs]);

  useEffect(() => {
    const notarizationMetadataCTA = defaultCTAForInputStatus();

    switch (notaryProofSelectionStatus) {
      case NotaryProofInputStatus.DEFAULT:
        setCtaButtonTitle(`Select ${notarizationMetadataCTA}`);
        break;

      case NotaryProofInputStatus.VALID:
      default:
        if (!isProofModalOpen) {
          setCtaButtonTitle(`Verify ${notarizationMetadataCTA}`);
        } else {
          setCtaButtonTitle(`Verifying ${notarizationMetadataCTA}`);
        }
        break;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notaryProofSelectionStatus, paymentPlatform, isProofModalOpen]);

  const defaultCTAForInputStatus = () => {
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        return 'Wise Tag';

      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
        return 'Multi Currency Id';

      case NotaryVerificationCircuit.TRANSFER:
        return 'Transaction';

      default:
        throw new Error('Invalid circuit type');
    }
  };

  /*
   * Component
   */

  const notarizationCopy = detectedNotarizationCopy();

  return (
    <Container>
      {!isSidebarInstalled ? (
        <InstallExtensionContainer>
          <IconAndCopyContainer>
            <ZapIcon strokeWidth={1} style={{ marginTop: '2em' }} />

            <ThemedText.DeprecatedBody textAlign="center">
              <div>
                { commonStrings.get('EXTENSION_DOWNLOAD_INSTRUCTIONS') }
                <Link
                  href="https://docs.zkp2p.xyz/zkp2p/user-guides/on-ramping/privacy-and-safety"
                  target="_blank"
                >
                  Learn More ↗
                </Link>
              </div>
            </ThemedText.DeprecatedBody>
          </IconAndCopyContainer>

          <Button
            onClick={handleInstallExtensionClicked}
            height={48}
            width={216}
            leftAccessorySvg={browserSvg()}
          >
            { addToBrowserCopy() }
          </Button>
        </InstallExtensionContainer>
      ) : (
        <ExtensionDetectedContainer>
          {isShowingTable ? (
            <TitleAndTableContainer>
              <TitleAndOAuthContainer>
                <NotarizationsTitleContainer>
                  <TitleLabel>Loaded Wise Requests</TitleLabel>
                </NotarizationsTitleContainer>

                <AccessoryButton
                  onClick={fetchData}
                  height={36}
                  title={'Refresh'}
                  icon={'refresh'}
                />
              </TitleAndOAuthContainer>

              {loadedNotaryProofs.length === 0 ? (
                <EmptyNotarizationsContainer>
                  <StyledUserX />

                  <ThemedText.SubHeaderSmall textAlign="center" lineHeight={1.3}>
                    { noNotarizationsErrorString() }
                  </ThemedText.SubHeaderSmall>
                </EmptyNotarizationsContainer>
              ) : (
                <Table>
                  {paginatedData.map((notarization, index) => (
                    <NotarizationRow
                      key={index}
                      subjectText={rowSubjectText(notarization)}
                      dateText={formatDateTime(notarization.date)}
                      isSelected={index === selectedIndex}
                      isLastRow={index === loadedNotaryProofs.length - 1}
                      onRowClick={() => handleRowClick(index)}
                      rowIndex={index + 1 + (currentPage) * ROWS_PER_PAGE}
                    />
                  ))}
                </Table>
              )}

              {loadedNotaryProofs.length > ROWS_PER_PAGE && (
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
            </TitleAndTableContainer>
          ) : (
              selectedIndex !== null ? (
                <TagDetectionContainer>
                  <TagDetectionIconAndCopyContainer>
                    <StyledUserCheck />

                    <ThemedText.SubHeaderSmall textAlign="center" lineHeight={1.3}>
                      {notarizationCopy.detected_copy}:&nbsp;<strong>{notarizationCopy.metadata_copy}</strong><br/>
                      Verify and submit this {notarizationCopy.metadata_type_copy} to complete {notarizationCopy.transaction_type_copy}
                    </ThemedText.SubHeaderSmall>
                  </TagDetectionIconAndCopyContainer>
                </TagDetectionContainer>
              ) : (
                <TagDetectionContainer>
                  <TagDetectionIconAndCopyContainer>
                    <StyledUserX />
    
                    <ThemedText.SubHeaderSmall textAlign="center" lineHeight={1.3}>
                      { noNotarizationsErrorString() }
                    </ThemedText.SubHeaderSmall>
                  </TagDetectionIconAndCopyContainer>
                </TagDetectionContainer>
              )
          )}

          <ButtonContainer>
            <Button
              disabled={notaryProofSelectionStatus !== NotaryProofInputStatus.VALID || isProofModalOpen}
              onClick={handleVerifyNotaryProofClicked}
            >
              {ctaButtonTitle}
            </Button>
          </ButtonContainer>

          {loadedNotaryProofs.length > 0 && (
            <TableToggleLink onClick={handleToggleNotarizationTablePressed}>
              {notarizationToggleCta()}
            </TableToggleLink>
          )}
        </ExtensionDetectedContainer>
      )}
    </Container>
  )
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  justify-content: center;

  background-color: ${colors.container};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 16px;
  overflow: hidden;
`;

const InstallExtensionContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: 36px;
  max-width: 50vh;
  min-height: 25vh;
  line-height: 1.3;
  gap: 36px;
`;

const IconAndCopyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const ZapIcon = styled(Zap)`
  ${IconStyle}
`;

const ExtensionDetectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`;

const EmptyNotarizationsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.9rem 0rem;
  max-width: 75%;
  margin: auto;
  gap: 1rem;
`;

const TitleAndTableContainer = styled.div`
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
  background-color: #090D14;
`;

const TitleAndOAuthContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.defaultBorderColor};
  padding: 1rem 1.5rem;
`;

const NotarizationsTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleLabel = styled.label`
  display: flex;
  font-size: 14px;
  color: #6C757D;
  align-items: center;
`;

const Table = styled.div`
  width: 100%;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.25);
  color: #616161;
`;

const ButtonContainer = styled.div`
  display: grid;
  padding-top: 1rem;
`;

const StyledUserX = styled(UserX)`
  color: #FFF;
  width: 28px;
  height: 28px;
`;

const StyledUserCheck = styled(UserCheck)`
  color: #FFF;
  width: 28px;
  height: 28px;
`;

const TableToggleLink = styled.button`
  width: 100%;
  font-size: 15px;
  font-family: 'Graphik';
  color: #FFFFFF;
  opacity: 0.3;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  display: inline;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
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

const TagDetectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #0A0D14;

  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 8px;
`;

const TagDetectionIconAndCopyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  gap: 1rem;

  border-radius: 8px;
`;
