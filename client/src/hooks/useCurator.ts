import { useCallback } from "react";

type QuoteMinFiatForTokenRequest = {
  processorNames: string[];
  receiveToken: string;
  fiatCurrencyCode: string;
  exactTokenAmount: string;
  caller: string;
}

type QuoteMaxTokenForFiatRequest = {
  processorNames: string[];
  receiveToken: string;
  fiatCurrencyCode: string;
  exactFiatAmount: string;
  caller: string;
}

type IntentSignalRequest = {
  processorName: string;
  depositId: string;
  amount: string;
  hashedOnchainId: string;
  toAddress: string;
  processorIntentData: any;
}

const API_URL = process.env.CURATOR_API_URL || "";

export default function useCurator() {
  const quoteMinFiatForExactToken = useCallback(
    async (data: QuoteMinFiatForTokenRequest): Promise<any> => {
      console.log("quoteMinFiatForExactToken: ", data);
      console.log("API_URL: ", API_URL);
      const response = await fetch(`${API_URL}/quote/exact-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.json();
        console.error("Failed to fetch quoteMinFiatForExactToken:", errorText);
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      return await response.json();
    },
    []
  );

  const quoteMaxTokenForExactFiat = useCallback(
    async (data: QuoteMaxTokenForFiatRequest): Promise<any> => {
      const response = await fetch(`${API_URL}/quote/exact-fiat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch quoteMaxTokenForExactFiat:", errorText);
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      return await response.json();
    },
    []
  );

  const createDepositOnCurator = async (processorName: string, depositData: any) => {
    const response = await fetch(`${API_URL}/deposits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ processorName, depositData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch createDeposit:", errorText);
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    return await response.json();
  };

  const signalIntentOnCurator = async (data: IntentSignalRequest) => {
    const response = await fetch(`${API_URL}/intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch signalIntent:", errorText);
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    return await response.json();
  };

  return {
    quoteMinFiatForExactToken,
    quoteMaxTokenForExactFiat,
    createDepositOnCurator,
    signalIntentOnCurator,
  };
}
