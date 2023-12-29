import React from 'react';
import styled from 'styled-components/macro';

import { LabeledSwitch } from "@components/common/LabeledSwitch";
import { commonStrings } from "@helpers/strings";
import useProofGenSettings from '@hooks/useProofGenSettings';

 
export const ProofSettings: React.FC = () => {
  /*
   * Context
   */

  const {
    isProvingTypeFast,
    setIsProvingTypeFast,
  } = useProofGenSettings();

  /*
   * Handlers
   */

  const handleProvingTypeChanged = (checked: boolean) => {
    if (setIsProvingTypeFast) {
      setIsProvingTypeFast(checked);
    }
  };

  /*
   * Component
   */

  return (
    <Container>
      <TogglesContainer>
        <ToggleWrapper>
          <LabeledSwitch
            switchChecked={isProvingTypeFast ?? true}
            onSwitchChange={handleProvingTypeChanged}
            checkedLabel={"Fast"}
            uncheckedLabel={"Private"}
            helperText={commonStrings.get('PROVING_TYPE_TOOLTIP')}
          />
        </ToggleWrapper>
      </TogglesContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TogglesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: flex-end
`;

const ToggleWrapper = styled.div`
  margin-right: calc(50% - 57px);
`;
