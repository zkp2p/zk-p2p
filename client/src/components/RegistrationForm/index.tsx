import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Col } from "../legacy/Layout";

import { ExistingRegistration } from "./ExistingRegistration";
import { NewRegistrationProof } from "./NewRegistrationProof";
import { NewRegistrationSubmit } from "./NewRegistrationSubmit";


interface RegistrationFormProps {
  // loggedInWalletAddress: string;
}
 
export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  // loggedInWalletAddress,
}) => {
  /*
    State
  */

  // ----- transaction state -----
  const [submitOrderPublicSignals, setSubmitOrderPublicSignals] = useState<string>('');
  const [submitOrderProof, setSubmitOrderProof] = useState<string>('');

  /*
    Hooks
  */

  // useEffect(() => {
  //   setRequestedUSDAmountInput(0);
  //   setRequestedAmount(0);
  // }, [selectedOrder]);

  /*
    Component
  */
  return (
    <ComponentWrapper>
      <Body>
        <ExistingRegistrationContainer>
          <ExistingRegistration />
        </ExistingRegistrationContainer>
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
      </Body>
    </ComponentWrapper>
  );
};

const ComponentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1200px;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const ExistingRegistrationContainer = styled.div`
  gap: 1rem;
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const NewRegistrationContainer = styled.div`
  display: grid;
  gap: 1rem;
  align-self: flex-start;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;
