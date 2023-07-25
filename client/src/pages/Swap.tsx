import styled from "styled-components";

import { Toggle } from "../components/Toggle";
import Pool from "../components/Pool"


export const Swap: React.FC<{}> = (props) => {
  return (
    <PageWrapper>
      <Main>
        <Toggle />
        <Pool />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;

  & .title {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  & .main {
    & .signaturePane {
      flex: 1;
      display: flex;
      flex-direction: column;
      & > :first-child {
        height: calc(30vh + 24px);
      }
    }
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

