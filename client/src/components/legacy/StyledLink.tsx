import React from 'react';
import styled from 'styled-components';


interface StyledLinkProps {
  urlHyperlink: string;
  label: string;
}

export const StyledLink: React.FC<StyledLinkProps> = ({ 
  urlHyperlink,
  label
}) => {
  return (
    <ParentContainer>
      <Link href={urlHyperlink} target="_blank" rel="noopener noreferrer">
        {label}
      </Link>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: inline-block;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
