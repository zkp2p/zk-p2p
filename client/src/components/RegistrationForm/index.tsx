import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAccount } from "wagmi";

import { Button } from '../Button'
import { ExistingRegistration } from "./ExistingRegistration";
import { NewRegistrationProof } from "./NewRegistrationProof";
import { NewRegistrationSubmit } from "./NewRegistrationSubmit";
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'

 
export const RegistrationForm: React.FC = () => {
  const { address } = useAccount();

  /*
    State
  */

  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");
  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);

  const handleUpdateClick = () => {
    setIsNewRegistration(prev => !prev);
  }

  // ----- transaction state -----
  const [submitOrderPublicSignals, setSubmitOrderPublicSignals] = useState<string>('');
  const [submitOrderProof, setSubmitOrderProof] = useState<string>('');

  /*
    Hooks
  */

  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
    } else {
      setEthereumAddress("");
    }
  }, [address]);

  /*
    Component
  */
  return (
    <Wrapper>
      <Column>
        <TitleRow padding="0">
          <ThemedText.HeadlineMedium>
            Registration
          </ThemedText.HeadlineMedium>
          <Button onClick={handleUpdateClick}>
            + Update
          </Button>
        </TitleRow>

        <Content>
          {!isNewRegistration ? (
            <ExistingRegistrationContainer>
              <ExistingRegistration
                loggedInWalletAddress={ethereumAddress}
              />
            </ExistingRegistrationContainer>
          ) : (
            <NewRegistrationContainer>
              <Column>
                <NewRegistrationProof
                  loggedInWalletAddress={'0x123'}
                  setSubmitOrderProof={setSubmitOrderProof}
                  setSubmitOrderPublicSignals={setSubmitOrderPublicSignals}
                />
              </Column>
              <Column>
                <NewRegistrationSubmit
                  proof={'{"pi_a":["3291784209879362577606086029850751887940155573303155039418365843301783849228","20372266672396218804322040936573741566123024771824035258362536004620900873588","1"],"pi_b":[["18182941061095370046889375561496614389216314328396531250907530953695244333029","19403457916758929009344186669414337242177199501412127017914415452213627069733"],["11197830984911287107893459669398460583304236692805521536999778875921167851272","12077687609501956208235428214356335182618912020383319054765276771144195362233"],["1","0"]],"pi_c":["12585383347322907138844813847360198340224278122693364672462605900163046933131","3061690965777783420357585230296215498333024532441086383579841927574404217720","1"],"protocol":"groth16","curve":"bn128"}'}
                  publicSignals={'["14725009150715507569351386527345409524196547864550498192724844424892192758335","53","0","0","683441457792668103047675496834917209","1011953822609495209329257792734700899","1263501452160533074361275552572837806","2083482795601873989011209904125056704","642486996853901942772546774764252018","1463330014555221455251438998802111943","2411895850618892594706497264082911185","520305634984671803945830034917965905","47421696716332554","0","0","0","0","0","0","0","0","18"]'}
                />
              </Column>
            </NewRegistrationContainer>
          )}
        </Content>
      </Column>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 680px;
  width: 100%;
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  padding: 1.5rem;
  border-radius: 16px;
  justify-content: center;
`;

const TitleRow = styled(RowBetween)`
  margin-bottom: 20px;
  height: 50px;
  align-items: flex-end;
  color: #FFF;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  };
`;

const Content = styled.div`
  gap: 1rem;
  align-self: flex-start;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ExistingRegistrationContainer = styled.div`
  padding: 1.5rem;
`;

const NewRegistrationContainer = styled.div`
  display: grid;
`;
