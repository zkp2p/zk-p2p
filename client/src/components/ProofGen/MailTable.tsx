import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components/macro'
import { Mail } from 'react-feather'

import { ThemedText } from '../../theme/text';
import { Button } from '../Button';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { TextButton } from '@components/common/TextButton';
import {
  fetchEmailsRaw,
  fetchVenmoEmailList,
  RawEmailResponse
} from '@hooks/useGmailClient';
import useGoogleAuth from '@hooks/useGoogleAuth';
import useProofGenSettings from '@hooks/useProofGenSettings';
import { MailRow } from './MailRow';
import { SIGN_IN_WITH_GOOGLE_INSTRUCTIONS } from "@helpers/tooltips";
import { FETCH_VENMO_EMAILS_AFTER_DATE } from '@helpers/constants';
import Link from '@mui/material/Link';
import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { Inbox } from 'react-feather';
interface MailTableProps {
  setEmailFull: (emailFull: string) => void;
  handleVerifyEmailClicked: () => void;
}

export const MailTable: React.FC<MailTableProps> = ({
  setEmailFull,
  handleVerifyEmailClicked,
}) => {
  /*
   * Context
   */

  const {
    googleAuthToken,
    isGoogleAuthed,
    loggedInGmail,
    scopesApproved,
    googleLogIn,
    googleLogOut,
  } = useGoogleAuth();

  const { setIsEmailModeAuth } = useProofGenSettings();

  /*
   * State
   */

  const [fetchedEmails, setFetchedEmails] = useState<RawEmailResponse[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  /*
   * Handlers
   */

  const handleRowClick = (index: number) => {
    setSelectedIndex(index);

    const email = fetchedEmails[index];

    setEmailFull(email.decodedContents);
  };

  const handleEmailModeChanged = (checked: boolean) => {
    if (setIsEmailModeAuth) {
      setIsEmailModeAuth(checked);
    }
  };

  /*
   * Helpers
   */

  function formatDateTime(unixTimestamp: string): string {
    const date = new Date(Number(unixTimestamp));
    const now = new Date();

    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric'
      });
    }
  }

  async function fetchData() {
    try {
      const emailListResponse = await fetchVenmoEmailList(googleAuthToken.access_token, {
        'q': `from:venmo@venmo.com subject:"You paid" after:${FETCH_VENMO_EMAILS_AFTER_DATE}`
      });

      const emailIds = emailListResponse.messages.map(message => message.id);
      if (emailIds.length > 0) {
        const emails = await fetchEmailsRaw(googleAuthToken.access_token, emailIds);

        setFetchedEmails(emails);

        console.log('Fetched Emails:', emails);
      }
    } catch (error) {
      console.error('Error in fetching data:', error);
    }
  };

  /*
   * Hooks
   */

  useEffect(() => {
    if (googleAuthToken && scopesApproved) {
      fetchData();
    }
  }, [scopesApproved]);

  useEffect(() => {
    setSelectedIndex(null);
    setEmailFull('');
  }, [fetchedEmails]);

  /*
   * Component
   */

  return (
    <Container>
      {!isGoogleAuthed ? (
        <ErrorContainer>
          <ThemedText.DeprecatedBody textAlign="center">
            <MailIcon strokeWidth={1} style={{ marginTop: '2em' }} />

            <div>
             { SIGN_IN_WITH_GOOGLE_INSTRUCTIONS }
              <Link
                href="https://docs.zkp2p.xyz/zkp2p/user-guides/on-ramping/privacy-and-safety"
                target="_blank"
              >
                Privacy and Safety ↗
              </Link>
            </div>
          </ThemedText.DeprecatedBody>

          <LoginOrUploadButtonContainer>
            <Button
              onClick={googleLogIn}
              height={48}
            >
              Sign in with Google
            </Button>

            <TextButton
              onClick={() => handleEmailModeChanged(false)}
              height={24}
              title={'Or Upload'}
            />
          </LoginOrUploadButtonContainer>
        </ErrorContainer>
      ) : (
        <LoggedInContainer>
          <TitleContainer>
            <ThemedText.SubHeader textAlign="left">
              Google Mail
            </ThemedText.SubHeader>

            <AccessoryButton
              onClick={googleLogOut}
              height={36}
              title={'Logout'}
              icon={'logout'}
            />
          </TitleContainer>

          <TitleAndTableContainer>
            <TitleAndOAuthContainer>
              <EmailAddressTitle>
                <EmailLabel>
                  <EmailLabelTitle>Logged in as:&nbsp;</EmailLabelTitle>
                  <EmailLabelValue>{loggedInGmail}</EmailLabelValue>
                </EmailLabel>
              </EmailAddressTitle>


              <AccessoryButton
                onClick={fetchData}
                height={36}
                title={'Refresh'}
                icon={'refresh'}
              />
            </TitleAndOAuthContainer>

            {fetchedEmails.length === 0 ? (
              <EmptyMailContainer>
                <StyledInbox />
                <ThemedText.LabelSmall textAlign="center" lineHeight={1.3}>
                  No Venmo emails found.
                  Please ensure you are using an email attached to a valid Venmo account.
                </ThemedText.LabelSmall>
              </EmptyMailContainer>
            ) : (
              <Table>
                {fetchedEmails.map((email, index) => (
                  <MailRow
                    key={index}
                    subjectText={email.subject}
                    dateText={formatDateTime(email.internalDate)}
                    isSelected={index === selectedIndex}
                    isLastRow={index === fetchedEmails.length - 1}
                    onRowClick={() => handleRowClick(index)}
                  />
                ))}
              </Table>
            )}
          </TitleAndTableContainer>

          <ButtonContainer>
            <Button
              disabled={selectedIndex == null}
              loading={false}
              onClick={handleVerifyEmailClicked}
            >
              Verify Email
            </Button>
          </ButtonContainer>
        </LoggedInContainer>
      )}
    </Container>
  )
}

const EmptyMailContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 0rem;
  max-width: 75%;
  margin: auto;
  gap: 1rem;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  justify-content: center;

  background-color: #0D111C;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  overflow: hidden;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: 36px 0px;
  max-width: 50vh;
  min-height: 25vh;
  line-height: 1.3;
  gap: 36px;
`;

const Icon = styled(SVGIconThemed)`
  width: 36px;
  height: 36px;
`;

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`;

const MailIcon = styled(Mail)`
  ${IconStyle}
`;

const LoggedInContainer = styled.div`
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
  border: 1px solid #98a1c03d;
  border-radius: 8px;
  background-color: #090D14;
`;

const TitleAndOAuthContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #98a1c03d;
  padding: 1rem 1.5rem;
`;

const EmailAddressTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EmailLabel = styled.label`
  display: flex;
  font-size: 14px;
  color: #FFFFFF;
  align-items: center;
`;

const EmailLabelTitle = styled.span`
  font-size: 14px;
  color: #6C757D;
`;

const EmailLabelValue = styled.span`
  font-size: 14px;
  color: #FFFFFF;
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

const LoginOrUploadButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  gap: 1rem;
`;

const StyledInbox = styled(Inbox)`
  color: #FFF;
`
