import React from "react";
import styled from 'styled-components/macro';

import { colors } from '@theme/colors';


interface NotarizationRowProps {
  subjectText: string;
  dateText: string;
  isSelected: boolean;
  isLastRow: boolean;
  onRowClick: () => void;
  rowIndex: number;
}

export const NotarizationRow: React.FC<NotarizationRowProps> = ({
  subjectText,
  dateText,
  isSelected,
  isLastRow,
  onRowClick,
  rowIndex
}: NotarizationRowProps) => {
  NotarizationRow.displayName = "NotarizationRow";

  const subjectLabel = `${subjectText}`;
  const dateLabel = `${dateText}`;

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
      isLastRow={isLastRow}
    >
      <IndexLabel> {rowIndex} </IndexLabel>
      <SubjectLabel> {subjectLabel} </SubjectLabel>
      <DateLabel> {dateLabel} </DateLabel>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean; isLastRow: boolean}>`
  display: grid;
  grid-template-columns: 0.2fr 1fr 0.2fr;
  grid-gap: 1px;
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  font-size: 14px;
  color: #FFFFFF;
  border-radius: ${({ isLastRow }) => isLastRow ? "0 0 8px 8px" : "0"};
  border-bottom: ${({ isLastRow }) => !isLastRow && `1px solid ${colors.defaultBorderColor}`};

  ${({ selected }) => selected && `
    background-color: #191D28;
    box-shadow: none;
  `}

  ${({ selected, isLastRow }) => !selected && `
    &:hover {
      background-color: #191D28;
      border-radius: ${isLastRow ? "0 0 8px 8px" : "0"};
      box-shadow: none;
    }
  `}
`;

const IndexLabel = styled.label`
  text-align: left;
`;

const SubjectLabel = styled.label`
  text-align: left;
`;

const DateLabel = styled.label`
  text-align: right;
`;
