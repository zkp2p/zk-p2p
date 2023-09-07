import styled from "styled-components";

import PermissionsForm from "@components/PermissionsForm"


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
  padding: 12px 8px 0px;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
