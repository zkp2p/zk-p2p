import { useState } from 'react';

type GetQuoteParams = {
  fromChainId: string,
  fromTokenAddress: string,
  toChainId: string,
  toTokenAddress: string,
  fromAmount: string,
  userAddress: string,
  uniqueRoutesPerBridge: string,
  sort: string,
  singleTxOnly: string
}

type GetTransactionDataParams = {
  route: any
}

type GetAllowanceParams = {
  chainId: string,
  owner: string,
  allowanceTarget: string,
  tokenAddress: string
}

type GetApprovalTransactionDataParams = {
  chainId: string,
  owner: string,
  allowanceTarget: string,
  tokenAddress: string,
  amount: string
}

type GetTransactionStatusParams = {
  transactionHash: string,
  fromChainId: string,
  toChainId: string
}

type SocketResponse = {
  result: any;
};

type SocketError = {
  code: number;
  message: string;
};

const API_KEY = '72a5b4b0-e727-48be-8aa1-5da9d62fe635'; // TODO: SOCKET PUBLIC API KEY

export default function useSocketBridge() {
  const [getQuoteData, setGetQuoteData] = useState<SocketResponse | null>(null);
  const [getRouteTransactionData, setGetRouteTransactionData] = useState<SocketResponse | null>(null);
  const [getAllowance, setGetAllowance] = useState<SocketResponse | null>(null);
  const [getApprovalTransactionData, setGetApprovalTransactionData] = useState<SocketResponse | null>(null);
  const [getTransactionStatus, setGetTransactionStatus] = useState<SocketResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<SocketError | null>(null);

  const fetchQuote = async ({ fromChainId, fromTokenAddress, toChainId, toTokenAddress, fromAmount, userAddress, uniqueRoutesPerBridge, sort, singleTxOnly }: GetQuoteParams) => {
    setLoading(true);

    const apiUrl = 'https://api.socket.tech/v2/quote';

    const queryParams = new URLSearchParams({
      fromChainId,
      fromTokenAddress,
      toChainId,
      toTokenAddress,
      fromAmount,
      userAddress,
      uniqueRoutesPerBridge,
      sort,
      singleTxOnly
    }).toString();

    const urlWithParams = `${apiUrl}?${queryParams}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'API-KEY': API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setGetQuoteData(result);
      } else if (response.status >= 400 && response.status < 500) {
        const errorResponse = await response.json();
        if (errorResponse && errorResponse.detail) {
          setError({
            code: errorResponse.detail.code,
            message: errorResponse.detail.message
          });
        } else {
          setError({
            code: response.status,
            message: 'An error occurred, but no additional details were provided.'
          });
        }
      } else {
        setError({
          code: response.status,
          message: `HTTP error! Status: ${response.status}`
        });
      }
    } catch (err) {
      console.log("err", err);
      // If there's an error in fetching or parsing the response, handle it here
      if (typeof err === 'string') {
        setError({
          code: 0,
          message: err
        });
      } else if (err instanceof Error) {
        setError({
          code: 0,
          message: err.message
        });
      } else {
        setError(err as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteTransactionData = async ({ route }: GetTransactionDataParams) => {
    setLoading(true);

    const apiUrl = 'https://api.socket.tech/v2/build-tx';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'API-KEY': API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "route": route })
      });

      if (response.ok) {
        const result = await response.json();
        setGetRouteTransactionData(result);
      } else if (response.status >= 400 && response.status < 500) {
        const errorResponse = await response.json();
        if (errorResponse && errorResponse.detail) {
          setError({
            code: errorResponse.detail.code,
            message: errorResponse.detail.message
          });
        } else {
          setError({
            code: response.status,
            message: 'An error occurred, but no additional details were provided.'
          });
        }
      } else {
        setError({
          code: response.status,
          message: `HTTP error! Status: ${response.status}`
        });
      }
    } catch (err) {
      console.log("err", err);
      // If there's an error in fetching or parsing the response, handle it here
      if (typeof err === 'string') {
        setError({
          code: 0,
          message: err
        });
      } else if (err instanceof Error) {
        setError({
          code: 0,
          message: err.message
        });
      } else {
        setError(err as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowance = async ({ chainId, owner, allowanceTarget, tokenAddress }: GetAllowanceParams) => {
    setLoading(true);

    const apiUrl = 'https://api.socket.tech/v2/approval/check-allowance';

    const queryParams = new URLSearchParams({ chainId, owner, allowanceTarget, tokenAddress }).toString();

    const urlWithParams = `${apiUrl}?${queryParams}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'API-KEY': API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setGetAllowance(result);
      } else if (response.status >= 400 && response.status < 500) {
        const errorResponse = await response.json();
        if (errorResponse && errorResponse.detail) {
          setError({
            code: errorResponse.detail.code,
            message: errorResponse.detail.message
          });
        } else {
          setError({
            code: response.status,
            message: 'An error occurred, but no additional details were provided.'
          });
        }
      } else {
        setError({
          code: response.status,
          message: `HTTP error! Status: ${response.status}`
        });
      }
    } catch (err) {
      console.log("err", err);
      // If there's an error in fetching or parsing the response, handle it here
      if (typeof err === 'string') {
        setError({
          code: 0,
          message: err
        });
      } else if (err instanceof Error) {
        setError({
          code: 0,
          message: err.message
        });
      } else {
        setError(err as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalTransactionData = async ({ chainId, owner, allowanceTarget, tokenAddress, amount }: GetApprovalTransactionDataParams) => {
    setLoading(true);

    const apiUrl = 'https://api.socket.tech/v2/approval/build-tx';

    const queryParams = new URLSearchParams({ chainId, owner, allowanceTarget, tokenAddress, amount }).toString();

    const urlWithParams = `${apiUrl}?${queryParams}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'API-KEY': API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setGetApprovalTransactionData(result);
      } else if (response.status >= 400 && response.status < 500) {
        const errorResponse = await response.json();
        if (errorResponse && errorResponse.detail) {
          setError({
            code: errorResponse.detail.code,
            message: errorResponse.detail.message
          });
        } else {
          setError({
            code: response.status,
            message: 'An error occurred, but no additional details were provided.'
          });
        }
      } else {
        setError({
          code: response.status,
          message: `HTTP error! Status: ${response.status}`
        });
      }
    } catch (err) {
      console.log("err", err);
      // If there's an error in fetching or parsing the response, handle it here
      if (typeof err === 'string') {
        setError({
          code: 0,
          message: err
        });
      } else if (err instanceof Error) {
        setError({
          code: 0,
          message: err.message
        });
      } else {
        setError(err as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStatus = async ({ transactionHash, fromChainId, toChainId }: GetTransactionStatusParams) => {
    setLoading(true);

    const apiUrl = 'https://api.socket.tech/v2/bridge-status';

    const queryParams = new URLSearchParams({ transactionHash, fromChainId, toChainId }).toString();

    const urlWithParams = `${apiUrl}?${queryParams}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'API-KEY': API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setGetTransactionStatus(result);
      } else if (response.status >= 400 && response.status < 500) {
        const errorResponse = await response.json();
        if (errorResponse && errorResponse.detail) {
          setError({
            code: errorResponse.detail.code,
            message: errorResponse.detail.message
          });
        } else {
          setError({
            code: response.status,
            message: 'An error occurred, but no additional details were provided.'
          });
        }
      } else {
        setError({
          code: response.status,
          message: `HTTP error! Status: ${response.status}`
        });
      }
    } catch (err) {
      console.log("err", err);
      // If there's an error in fetching or parsing the response, handle it here
      if (typeof err === 'string') {
        setError({
          code: 0,
          message: err
        });
      } else if (err instanceof Error) {
        setError({
          code: 0,
          message: err.message
        });
      } else {
        setError(err as any);
      }
    } finally {
      setLoading(false);
    }
  };

  return { 
    getQuoteData,
    getRouteTransactionData,
    getAllowance,
    getApprovalTransactionData,
    getTransactionStatus,
    loading,
    error,
    fetchQuote,
    fetchRouteTransactionData,
    fetchAllowance,
    fetchApprovalTransactionData,
    fetchTransactionStatus
  };
};
