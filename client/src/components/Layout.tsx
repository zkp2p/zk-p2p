import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  align-items: center;
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RowSpaceBetween = styled(Row)`
  justify-content: space-between;
`;

export const CenterAllDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Header = styled.h2`
  font-weight: 600;
  color: #fff;
  font-size: 2.25rem;
  line-height: 2.5rem;
  letter-spacing: -0.02em;
  margin-top: 0;
`;

export const SubHeader = styled(Header)`
  font-size: 1.7em;
  color: rgba(255, 255, 255, 0.9);
`;

export const H3 = styled(SubHeader)`
  font-size: 1.4em;
  margin-bottom: -8px;
`;
