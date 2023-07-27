import styled from "styled-components";

import { PermissionsForm } from "../components/PermissionsForm"


export const Permissions: React.FC<{}> = (props) => {
  return (
    <PageWrapper>
      <Main>
        <PermissionsForm />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 8px 0px;

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
