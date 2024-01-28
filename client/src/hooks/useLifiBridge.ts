import { useState } from 'react';

type GetQuoteParams = {
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string
  toAddress: string
}

type GetQuoteResponse = {
  result: any;
};

type GetQuoteError = {
  code: number;
  message: string;
};

export default function useLifiBridge() {
  const [data, setData] = useState<GetQuoteResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<GetQuoteError | null>(null);

  const fetchQuote = async ({ fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, toAddress }: GetQuoteParams) => {
    setLoading(true);

    const apiUrl = 'https://li.quest/v1/quote';

    const queryParams = new URLSearchParams({
      fromChain: fromChain,
      toChain: toChain,
      fromToken: fromToken,
      toToken: toToken,
      fromAmount: fromAmount,
      fromAddress: fromAddress,
      toAddress: toAddress
    }).toString();

    const urlWithParams = `${apiUrl}?${queryParams}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
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

  return { data, loading, error, fetchQuote };
};
