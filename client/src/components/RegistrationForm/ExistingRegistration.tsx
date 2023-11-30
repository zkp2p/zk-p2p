import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import Link from '@mui/material/Link';
import { CheckCircle, Box } from 'react-feather';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';

import { Button } from "@components/Button";
import { Col } from "@components/legacy/Layout";
import { CustomConnectButton } from "@components/common/ConnectButton";
import { NumberedStep } from "@components/common/NumberedStep";
import { ReadOnlyInput } from "@components/RegistrationForm/ReadOnlyInput";
import QuestionHelper from '@components/common/QuestionHelper';
import { RowBetween } from '@components/layouts/Row';
import { ThemedText } from '../../theme/text';
import { REGISTRATION_INSTRUCTIONS, REGISTRATION_NFT_TOOLTIP } from '@helpers/tooltips';
import useAccount from '@hooks/useAccount';
import useRegistration from '@hooks/useRegistration';
import useSmartContracts from '@hooks/useSmartContracts';


interface ExistingRegistrationProps {
  handleNewRegistrationClick: () => void;
}
 
export const ExistingRegistration: React.FC<ExistingRegistrationProps> = ({
  handleNewRegistrationClick
}) => {
  /*
   * Contexts
   */

  const { isLoggedIn } = useAccount();
  const { registrationHash, isRegistered, venmoNftUri, refetchVenmoNftId } = useRegistration();
  const { venmoNftAddress, venmoNftAbi } = useSmartContracts();

  const [shouldConfigureMintSbtWrite, setShouldConfigureMintSbtWrite] = useState<boolean>(false);

  /*
   * Contract Writes
   */

  //
  // offRamp(bytes32 _venmoId, uint256 _depositAmount, uint256 _receiveAmount)
  //
  const { config: writeSubmitSbtConfig } = usePrepareContractWrite({
    address: venmoNftAddress,
    abi: venmoNftAbi,
    functionName: 'mintSBT',
    enabled: shouldConfigureMintSbtWrite
  });

  const {
    data: submitMintSbtResult,
    isLoading: isSubmitMintSbtLoading,
    // writeAsync: writeSubmitMintSbtAsync,
  } = useContractWrite(writeSubmitSbtConfig);

  const {
    isLoading: isSubmitMintSbtMining
  } = useWaitForTransaction({
    hash: submitMintSbtResult ? submitMintSbtResult.hash : undefined,
    onSuccess(data) {
      console.log('writeSubmitMintSbtAsync successful: ', data);

      refetchVenmoNftId?.();
    },
  });

  /*
   * Handlers
   */

  // const handleMintSbtSubmit = async () => {
  //   try {
  //     await writeSubmitMintSbtAsync?.();
  //   } catch (error) {
  //     console.log('writeSubmitMintSbtAsync failed: ', error);
  //   }
  // };

  /*
   * Hooks
   */

  useEffect(() => {
    if (isRegistered && !venmoNftUri) {
      setShouldConfigureMintSbtWrite(true);
    } else {
      setShouldConfigureMintSbtWrite(false);
    }
  }, [isRegistered, venmoNftUri])

  /*
   * Component
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
          ) : null}
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
              { !isRegistered && (
                <NumberedInputContainer>
                  <NumberedStep>
                    { REGISTRATION_INSTRUCTIONS }
                    <Link
                      href="https://docs.zkp2p.xyz/zkp2p/user-guides/registration"
                      target="_blank"
                    >
                      Learn more ↗
                    </Link>
                  </NumberedStep>
                </NumberedInputContainer>
              )}
              
              { (shouldConfigureMintSbtWrite || venmoNftUri) && (
                <RegistrationNftContainer>
                  {venmoNftUri && (
                    <div dangerouslySetInnerHTML={{ __html: venmoNftUri }} />
                  )}

                  {shouldConfigureMintSbtWrite && (
                    <MintNftContainer>
                      <ThemedText.DeprecatedBody textAlign="center">
                        <BoxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                        <DescriptionAndHelperContainer>
                          Your ZKP2P Proof of Registration NFT will appear here&nbsp;
                          <QuestionHelper text={REGISTRATION_NFT_TOOLTIP} />
                        </DescriptionAndHelperContainer>
                      </ThemedText.DeprecatedBody>
                      <Button
                        loading={isSubmitMintSbtMining || isSubmitMintSbtLoading}
                        height={40}
                        onClick={() => {}}
                        fullWidth={true}
                      >
                        Coming Soon
                      </Button>
                    </MintNftContainer>
                  )}
                </RegistrationNftContainer>
              )}

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
  display: flex;
  align-items: center;
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

const CheckCircleIcon = styled(CheckCircle)`
  ${IconStyle}
`;

const BoxIcon = styled(Box)`
  ${IconStyle}
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;

const RegistrationNftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MintNftContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  border-radius: 16px;
  border: 3px dotted #98a1c03d;
  width: 244px;
  height: 414px;
  padding: 0px 20px;
  background-color: #131A2A;
  gap: 36px;
`;

const DescriptionAndHelperContainer = styled.div`
  vertical-align: middle;
  line-height: 1.3;
`;
