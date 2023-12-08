import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from "styled-components";

import { ThemedText } from './theme/text';


interface Props {
  children: ReactNode;
};

interface State {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Uncaught error:", error, errorInfo);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <ThemedText.LargeHeader>
            Something went wrong.
          </ThemedText.LargeHeader>
        </Container>
      );
    }

    return this.props.children; 
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`;

export default ErrorBoundary;
