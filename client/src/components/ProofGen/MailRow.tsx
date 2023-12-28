import React from "react";
import styled from 'styled-components/macro';


interface MailRowProps {
  platformText: string;
  subjectText: string;
  dateText: string;
  isSelected: boolean;
  isLastRow: boolean;
  onRowClick: () => void;
}

export const MailRow: React.FC<MailRowProps> = ({
  platformText,
  subjectText,
  dateText,
  isSelected,
  isLastRow,
  onRowClick,
}: MailRowProps) => {
  MailRow.displayName = "MailRow";

  const subjectLabel = `${subjectText}`;
  const dateLabel = `${dateText}`;

  const isPlatformTextLong = subjectText.length > 40;

  return (
    <Container
      onClick={onRowClick}
      selected={isSelected}
      isLastRow={isLastRow}
      isPlatformTextLong={isPlatformTextLong}
    >
      <PlatformLabel> {platformText} </PlatformLabel>
      <SubjectLabel> {subjectLabel} </SubjectLabel>
      <DateLabel> {dateLabel} </DateLabel>
    </Container>
  );
};

const Container = styled.div<{ selected: boolean; isLastRow: boolean, isPlatformTextLong: boolean}>`
  display: grid;
  grid-template-columns: ${({ isPlatformTextLong }) => isPlatformTextLong ? '1.5fr 7fr 1.25fr' : '1.5fr 3fr 1fr'};
  grid-gap: 1px;
  padding: 0.99rem 1.49rem;
  font-size: 14px;
  color: #FFFFFF;
  border-radius: ${({ isLastRow }) => isLastRow ? "0 0 8px 8px" : "0"};
  border-bottom: ${({ isLastRow }) => !isLastRow && "1px solid #98a1c03d"};

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

const PlatformLabel = styled.label`
  text-align: left;
`;

const SubjectLabel = styled.label`
  text-align: left;
`;

const DateLabel = styled.label`
  text-align: right;
`;
