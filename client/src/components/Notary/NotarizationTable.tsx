import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { Sidebar, UserX, UserCheck } from 'react-feather';
import Link from '@mui/material/Link';
import { isChrome, isFirefox, isChromium } from 'react-device-detect';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { NotarizationRow } from '@components/Notary/NotarizationRow';
import { ExtensionNotaryProofRequest } from '@hooks/useBrowserExtension';
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
const NOTARY_PROOF_FETCH_INTERVAL = 5000;
// const BROWSER_EXTENSION_ID = 'onkppmjkpbfbfbjoecignlobdpcbnkbg';
const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';

const USE_WISE_DEFAULT_DEPOSITOR = process.env.USE_WISE_DEFAULT_DEPOSITOR;
const WISE_DEFAULT_DEPOSITOR_REGISTRATION_PROOF = process.env.WISE_DEFAULT_DEPOSITOR_REGISTRATION_PROOF;
const WISE_DEFAULT_DEPOSITOR_MC_ID_PROOF = process.env.WISE_DEFAULT_DEPOSITOR_MC_ID_PROOF;

type ExtensionNotaryProofRow = {
  proof: string;
  metadata: string;
  subject: string;
  date: string;
};

interface NotarizationTableProps {
  paymentPlatform: PaymentPlatformType;
  circuitType: NotaryVerificationCircuitType;
  setNotaryProof: (notarization: string) => void;
  setNotaryProofMetadata: (metadata: string) => void;
  handleVerifyNotaryProofClicked: () => void;
  notaryProofSelectionStatus: string;
  isProofModalOpen: boolean;
};

export const NotarizationTable: React.FC<NotarizationTableProps> = ({
  paymentPlatform,
  circuitType,
  setNotaryProof,
  setNotaryProofMetadata,
  handleVerifyNotaryProofClicked,
  notaryProofSelectionStatus,
  isProofModalOpen
}) => {
  /*
   * Context
   */

  const {
    openSidebar,
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

  const [isInstallExtensionClicked, setIsInstallExtensionClicked] = useState<boolean>(false);

  /*
   * Handlers
   */

  const handleInstallExtensionClicked = () => {
    window.open(CHROME_EXTENSION_URL, '_blank');
    setIsInstallExtensionClicked(true)
  };

  const handleRowClick = (index: number) => {
    setSelectedIndex(index);

    const notarization = loadedNotaryProofs[index];
    
    setNotaryProof(notarization.proof);
    setNotaryProofMetadata(notarization.metadata);
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

  function parseTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
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
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric'
      });
    }
  };

  const detectedNotarizationCopy = () => {
    if (selectedIndex !== null) {
      const selectedRequest = paginatedData[selectedIndex];
      
      switch (circuitType) {
        case NotaryVerificationCircuit.REGISTRATION_TAG:
          return {
            detected_copy: 'The following tag was detected from your Wise account',
            metadata_copy: selectedRequest.metadata,
            metadata_type_copy: 'tag',
            transaction_type_copy: 'registration'
          };
  
        case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
          return {
            detected_copy: 'The following transaction receipt was detected from your Wise account',
            metadata_copy: `€${selectedRequest.metadata} EUR on ${selectedRequest.date}`,
            metadata_type_copy: 'history transaction receipt',
            transaction_type_copy: 'depositor registration'
          };
  
        case NotaryVerificationCircuit.TRANSFER:
          return {
            detected_copy: 'The following transaction was detected from your Wise account history',
            metadata_copy: `€${selectedRequest.metadata} EUR on ${selectedRequest.date}`,
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
    } else {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      intervalId = setInterval(callback, NOTARY_PROOF_FETCH_INTERVAL);
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
    if (!isInstallExtensionClicked) {
      return;
    }
  
    let intervalId: NodeJS.Timeout | null = null;
  
    const setupInterval = (callback: () => void) => {
      callback();
  
      if (intervalId) {
        clearInterval(intervalId);
      };
      
      intervalId = setInterval(callback, NOTARY_PROOF_FETCH_INTERVAL);
    };
  
    if (!isSidebarInstalled) {
      setupInterval(refetchExtensionVersion);
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuitType, isInstallExtensionClicked, isSidebarInstalled]);

  useEffect(() => {
    switch (circuitType) {
      case NotaryVerificationCircuit.REGISTRATION_TAG:
        let defaultDepositorProof: (ExtensionNotaryProofRow | null) = null;
        if (USE_WISE_DEFAULT_DEPOSITOR === 'true') {
          defaultDepositorProof = {
            proof: WISE_DEFAULT_DEPOSITOR_REGISTRATION_PROOF,
            subject: '[env] Request for @richardl3291',
            metadata: 'richardl3291',
            date: 'N/A'
          } as ExtensionNotaryProofRow;
        }
        
        let allAccountProofRows = defaultDepositorProof ? [defaultDepositorProof] : [];
        if (profileProofs && profileProofs.length > 0) {
          const fetchedProfileProofRows = profileProofs.map((request: ExtensionNotaryProofRequest) => {
            const wiseTag = request.metadata[1].split('@')[1];
            const subject = `Request for @${wiseTag}`;

            return {
              proof: JSON.stringify(request.proof),
              subject: subject,
              metadata: wiseTag,
              date: parseTimestamp(request.metadata[0])
            } as ExtensionNotaryProofRow;
          });
    
          setLoadedNotaryProofs(fetchedProfileProofRows.concat(allAccountProofRows));
        } else {
          setLoadedNotaryProofs(allAccountProofRows);
        }
        break;

      case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
        let defaultDepositorTransferProof: (ExtensionNotaryProofRow | null) = null;
        if (USE_WISE_DEFAULT_DEPOSITOR === 'true') {
          defaultDepositorTransferProof = {
            proof: WISE_DEFAULT_DEPOSITOR_MC_ID_PROOF,
            subject: '[env] Sent €0.1 EUR',
            metadata: '0.1',
            date: 'N/A'
          } as ExtensionNotaryProofRow;
        }

        let allTransferProofRows = defaultDepositorTransferProof ? [defaultDepositorTransferProof] : [];
        if (transferProofs && transferProofs.length > 0) {
          const fetchedTransferProofRows = transferProofs.map((request: ExtensionNotaryProofRequest) => {
            const [timestamp, amount, currency] = request.metadata;
            const subject = `Sent €${amount} ${currency}`;

            return {
              proof: JSON.stringify(request.proof),
              subject: subject,
              metadata: amount,
              date: parseTimestamp(timestamp)
            } as ExtensionNotaryProofRow;
          });
    
          setLoadedNotaryProofs(fetchedTransferProofRows.concat(allTransferProofRows));
        } else {
          setLoadedNotaryProofs(allTransferProofRows);
        }
        break;

      case NotaryVerificationCircuit.TRANSFER:
        if (transferProofs && transferProofs.length > 0) {
          const transferProofRows = transferProofs.map((request: ExtensionNotaryProofRequest) => {
            const [timestamp, amount, currency] = request.metadata;
            const subject = `Sent €${amount} ${currency}`;

            return {
              proof: JSON.stringify(request.proof),
              subject: subject,
              metadata: amount,
              date: parseTimestamp(timestamp)
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

      if (selectedIndex == null) {
        setSelectedIndex(0);
        setNotaryProof(firstAccountNotarization.proof);
      }
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
            <SidebarIcon strokeWidth={1} style={{ marginTop: '2em' }} />

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
            loading={isInstallExtensionClicked}
            disabled={isInstallExtensionClicked}
          >
            { addToBrowserCopy() }
          </Button>
          { isInstallExtensionClicked && (
            <ThemedText.LabelSmall textAlign="left">
              Waiting for installation...
            </ThemedText.LabelSmall>
          )}
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
                      subjectText={notarization.subject}
                      dateText={notarization.date}
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
                      {notarizationCopy.detected_copy}:&nbsp;<strong>{notarizationCopy.metadata_copy}</strong>. 
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

          {
            loadedNotaryProofs.length === 0 ? (
              <ButtonContainer>
                <Button
                  onClick={openSidebar}
                >
                  {'Open Sidebar'}
                </Button>
              </ButtonContainer>
            ) : (
              <ButtonContainer>
                <Button
                  disabled={notaryProofSelectionStatus === NotaryProofInputStatus.DEFAULT || isProofModalOpen}
                  onClick={handleVerifyNotaryProofClicked}
                >
                  {ctaButtonTitle}
                </Button>
              </ButtonContainer>
            )
          }

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

const SidebarIcon = styled(Sidebar)`
  ${IconStyle}
  transform: rotate(180deg);
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
  padding: 2rem 3rem;
  gap: 1rem;

  border-radius: 8px;
`;
