import React from "react";
import styled from 'styled-components';
import { ArrowRight } from 'react-feather';


interface LoginTypeButtonProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const LoginTypeButton: React.FC<LoginTypeButtonProps> = ({
  label,
  value,
  icon,
  onClick,
}: LoginTypeButtonProps) => {
  LoginTypeButton.displayName = "Input";

  return (
    <Container onClick={onClick}>
      <IconContainer>
        {icon && (
          <StyledIcon>
            <IconBorder>{icon}</IconBorder>
          </StyledIcon>
        )}
      </IconContainer>

      <LabelContainer>
        <TitleLabel>
          {value}
        </TitleLabel>
        <DescriptionLabel>
          {label}
        </DescriptionLabel>
      </LabelContainer>

      <ArrowRightContainer>
        <StyledArrowRight />
      </ArrowRightContainer>
    </Container>
  );
};

const Container = styled.button`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  padding: 16px 20px 16px 24px;
  border-radius: 16px;
  border: 1px solid #98a1c03d;
  background-color: #131A2A;

  &:hover {
    background-color: #1A2236;
    border-color: #CED4DA;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
  
  font-family: 'Graphik';
  cursor: pointer;
  transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  align-items: center;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconBorder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  border: 1px solid #FFF;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-top: 4px;
  min-width: 165px;
  color: #CED4DA;
`;

const TitleLabel = styled.label`
  display: flex;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const DescriptionLabel = styled.label`
  display: flex;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
`;

const StyledArrowRight = styled(ArrowRight)`
  color: #FFF;
`;

const ArrowRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
