import React from 'react';
import styled from 'styled-components';

import { colors } from '@theme/colors';
import { ThemedText } from '@theme/text';


interface InstructionTitleProps {
  number: number,
  title: string,
  description: string,
}

export const InstructionTitle: React.FC<InstructionTitleProps> = ({
  number,
  title,
  description,
}: InstructionTitleProps) => {
  InstructionTitle.displayName = 'InstructionTitle';

  /*
   * Component
   */

  return (
    <Container>
      <NumberContainer>
        { number }
      </NumberContainer>

      <TitleAndDescriptionContainer>
        <ThemedText.LabelSmall style={{ flex: '1', textAlign: 'left' }}>
          { title }
        </ThemedText.LabelSmall>

        <ThemedText.SubHeaderSmall style={{ flex: '1', textAlign: 'left' }}>
          { description }
        </ThemedText.SubHeaderSmall>
      </TitleAndDescriptionContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0rem 0.75rem;
  gap: 1.25rem;
`;

const NumberContainer = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const TitleAndDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0rem 0.25rem;
  gap: 0.25rem;
  line-height: 1.3;

  color: ${colors.white};
  font-size: 14px;
`;
