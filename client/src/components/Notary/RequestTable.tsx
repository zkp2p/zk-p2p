import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { Zap, UserX } from 'react-feather';
import Link from '@mui/material/Link';
import { isChrome, isFirefox, isChromium } from 'react-device-detect';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Button } from '@components/common/Button';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { RequestRow } from '@components/Notary/RequestRow';
import {
  fetchWiseTagNotarizations,
  fetchMultiCurrencyIdNotarizations,
  fetchTransferNotarizations,
  Notarization,
} from '@hooks/useBrowserExtension';
import {
  NotaryProofInputStatus,
  NotaryVerificationCircuitType,
  NotaryVerificationCircuit,
  PaymentPlatformType,
  PaymentPlatform
} from '@helpers/types';
import { commonStrings, platformStrings } from "@helpers/strings";

import chromeSvg from '../../assets/images/browsers/chrome.svg';
import braveSvg from '../../assets/images/browsers/brave.svg';
import firefoxSvg from '../../assets/images/browsers/firefox.svg';


interface RequestTableProps {
  paymentPlatform: PaymentPlatformType;
  circuitType: NotaryVerificationCircuitType;
  setTagNotarization: (notarization: string) => void;
  handleVerifyNotarizationClicked: () => void;
  notarizationSelectionStatus: string;
  isProofModalOpen: boolean;
};

export const RequestTable: React.FC<RequestTableProps> = ({
  paymentPlatform,
  circuitType,
  setTagNotarization,
  handleVerifyNotarizationClicked,
  notarizationSelectionStatus,
  isProofModalOpen
}) => {
  /*
   * Context
   */

  // no-op

  /*
   * State
   */

  const [browser, setBrowser] = useState<string>("");

  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(false);

  const [injectedTagNotarizations, setInjectedTagNotarizations] = useState<Notarization[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

  const [isShowingTable, setIsShowingTable] = useState<boolean>(false);

  /*
   * Handlers
   */

  const handleInstallExtensionClicked = () => {
    setIsExtensionInstalled(true);
  };

  const handleRowClick = (index: number) => {
    setSelectedIndex(index);

    const notarization = injectedTagNotarizations[index];
    
    setTagNotarization(notarization.proof);
  };

  const handleToggleRequestTablePressed = () => {
    setIsShowingTable(!isShowingTable);
  };

  /*
   * Helpers
   */

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

  const rowPlatformText = () => {
   switch (paymentPlatform) {
      case PaymentPlatform.WISE:
        return 'Wise';

      default:
        return '';
    }
  };

  const rowSubjectText = (injectedNotarization: Notarization) => {
    switch (paymentPlatform) {
      case PaymentPlatform.WISE:
        return injectedNotarization.metadata;

      default:
        return '';
    }
  };

  async function fetchData() {
    let notarizations = [];

    if (isShowingTable) {
      switch (circuitType) {
        case NotaryVerificationCircuit.REGISTRATION_TAG:
          notarizations = await fetchWiseTagNotarizations();
          break;
  
        case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
          notarizations = await fetchMultiCurrencyIdNotarizations();
          break;
  
        case NotaryVerificationCircuit.TRANSFER:
          notarizations = await fetchTransferNotarizations();
          break;
  
        default:
          throw new Error('Invalid circuit type');
      };

      if (notarizations.length > 0) {
        setInjectedTagNotarizations(notarizations);
      } else {
        setInjectedTagNotarizations([]);
      };
    } else {
      window.postMessage({ type: 'FETCH_REQUEST_HISTORY' }, '*');
  
      console.log('Client posted FETCH_REQUEST_HISTORY message');
    };
  };

  /*
   * Hooks
   */

  useEffect(() => {
    async function detectBrowser() {
      setBrowser(await getBrowser());
    }

    detectBrowser();
  }, []);

  useEffect(() => {
    setSelectedIndex(null);
    setTagNotarization('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedTagNotarizations]);

  useEffect(() => {
    const handleMessage = function(event: { origin: string; data: { type: string; status: string; }; }) {
      if (event.origin !== window.location.origin) {
        return;
      };

      if (event.data.type && event.data.type === "REQUEST_HISTORY_RESPONSE") {
        console.log('Client received REQUEST_HISTORY_RESPONSE message');

        console.log(event);
      };
    };
  
    window.addEventListener("message", handleMessage);

    fetchData();
  
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const notarizationMetadataCTA = defaultCTAForInputStatus();

    switch (notarizationSelectionStatus) {
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
  }, [notarizationSelectionStatus, paymentPlatform, isProofModalOpen]);

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

  return (
    <Container>
      {!isExtensionInstalled ? (
        <ErrorContainer>
          <ThemedText.DeprecatedBody textAlign="center">
            <ZapIcon strokeWidth={1} style={{ marginTop: '2em' }} />

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

          <InstallExtensionButtonContainer>
            <Button
              onClick={handleInstallExtensionClicked}
              height={48}
              width={216}
              leftAccessorySvg={browserSvg()}
            >
              Add to Chrome
            </Button>
          </InstallExtensionButtonContainer>
        </ErrorContainer>
      ) : (
        <ExtensionDetectedContainer>
          <TitleContainer>
            <ThemedText.SubHeader textAlign="left">
              Notarizations
            </ThemedText.SubHeader>
          </TitleContainer>

          {isShowingTable ? (
            <TitleAndTableContainer>
              <TitleAndOAuthContainer>
                <NotarizationsTitleContainer>
                  <TitleLabel>Confirmed Wise Requests</TitleLabel>
                </NotarizationsTitleContainer>

                <AccessoryButton
                  onClick={fetchData}
                  height={36}
                  title={'Refresh'}
                  icon={'refresh'}
                />
              </TitleAndOAuthContainer>

              {injectedTagNotarizations.length === 0 ? (
                <EmptyNotarizationsContainer>
                  <StyledUserX />
                  <ThemedText.SubHeaderSmall textAlign="center" lineHeight={1.3}>
                    { platformStrings.getForPlatform(paymentPlatform, 'NO_NOTARIZATIONS_ERROR') }
                  </ThemedText.SubHeaderSmall>
                </EmptyNotarizationsContainer>
              ) : (
                <Table>
                  {injectedTagNotarizations.map((notarization, index) => (
                    <RequestRow
                      key={index}
                      platformText={rowPlatformText()}
                      subjectText={rowSubjectText(notarization)}
                      dateText={formatDateTime(notarization.date)}
                      isSelected={index === selectedIndex}
                      isLastRow={index === injectedTagNotarizations.length - 1}
                      onRowClick={() => handleRowClick(index)}
                    />
                  ))}
                </Table>
              )}
            </TitleAndTableContainer>
          ) : (
            <TagFoundContainer>
              We detected a tag for you!
            </TagFoundContainer>
          )}

          <ButtonContainer>
            <Button
              disabled={notarizationSelectionStatus !== NotaryProofInputStatus.VALID || isProofModalOpen}
              onClick={handleVerifyNotarizationClicked}
            >
              {ctaButtonTitle}
            </Button>
          </ButtonContainer>

          <TableToggleLink onClick={handleToggleRequestTablePressed}>
            {notarizationToggleCta()}
          </TableToggleLink>
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

const ErrorContainer = styled.div`
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

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0px 1rem;
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

const TagFoundContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #FFFFFF;
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

const InstallExtensionButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  gap: 1rem;
`;

const StyledUserX = styled(UserX)`
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
