import React from 'react';
import styled, { css } from 'styled-components';
import Link from '@mui/material/Link';
import { CheckCircle } from 'react-feather';

import { Button } from "../Button";
import { Col } from "../legacy/Layout";
import { CustomConnectButton } from "../common/ConnectButton";
import { NumberedStep } from "../common/NumberedStep";
import { ReadOnlyInput } from "@components/RegistrationForm/ReadOnlyInput";
import { RowBetween } from '../layouts/Row';
import { ThemedText } from '../../theme/text';
import { REGISTRATION_INSTRUCTIONS } from '@helpers/tooltips';
import useAccount from '@hooks/useAccount';
import useRegistration from '@hooks/useRegistration'


interface ExistingRegistrationProps {
  handleNewRegistrationClick: () => void;
}
 
export const ExistingRegistration: React.FC<ExistingRegistrationProps> = ({
  handleNewRegistrationClick
}) => {
  /*
    Contexts
  */

  const { isLoggedIn } = useAccount();
  const { registrationHash, isRegistered } = useRegistration();

  /*
    Component
  */
  return (
    <Container>
      <Column>
        <TitleRow>
          <ThemedText.HeadlineMedium>
            Registration
          </ThemedText.HeadlineMedium>
          {isLoggedIn && !isRegistered ? (
            <Button onClick={handleNewRegistrationClick} height={40}>
                + Register
            </Button>
          ) : (
            <Button disabled={true} height={40}>
                + Mint NFT (Coming Soon)
            </Button>
          )}
        </TitleRow>

        <Content>
          {!isLoggedIn ? (
                <ErrorContainer>
                  <ThemedText.DeprecatedBody textAlign="center">
                    <CheckCircleIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                    <div>
                      Your Venmo registration will appear here.
                    </div>
                  </ThemedText.DeprecatedBody>
                  <CustomConnectButton />
                </ErrorContainer>
          ) : (
            <Body>
              <NumberedInputContainer>
                <NumberedStep>
                  { REGISTRATION_INSTRUCTIONS }
                  <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/registration " target="_blank">
                    Learn more ↗
                  </Link>
                </NumberedStep>
              </NumberedInputContainer>

              <InputsContainer>
                <ReadOnlyInput
                  label="Status"
                  name={`depositAmount`}
                  value={isRegistered ? "Registered" : "Not Registered"}
                />
                
                {
                  isRegistered && <ReadOnlyInput
                    label="Venmo Identifier"
                    name={`venmoProfile`}
                    value={registrationHash ? registrationHash : ""}
                  />
                }
              </InputsContainer>
            </Body>
          )}
        </Content>
      </Column>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Column = styled.div`
  align-self: flex-start;
  justify-content: center;
  border-radius: 16px;
  gap: 1rem;
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
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const CheckCircleIcon = styled(CheckCircle)`
  ${IconStyle}
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;
