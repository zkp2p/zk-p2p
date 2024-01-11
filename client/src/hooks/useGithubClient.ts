import { useState } from 'react';
import crypto from 'crypto';


const HDFC_DENY_LIST_URL = process.env.HDFC_DENY_LIST_URL;
if (!HDFC_DENY_LIST_URL) {
  throw new Error("HDFC_DENY_LIST_URL environment variable is not defined.");
}

type FetchDenyListResponse = {
  hdfcDenyList: string[];
};

type FetchDenyListError = {
  code: number;
};

export default function useUpiValidation() {
  const [data, setData] = useState<FetchDenyListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FetchDenyListError | null>(null);

  const generateNonce = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  const fetchData = async () => {
    setLoading(true);

    const nonce = generateNonce();
    if (!HDFC_DENY_LIST_URL) {
      throw new Error("Invalid deny list url.");
    }

    const urlWithParams = new URL(HDFC_DENY_LIST_URL);
    urlWithParams.searchParams.append("nonce", nonce);

    try {
      const response = await fetch(urlWithParams.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();

        const hdfcDenyList = result['depositors'];

        setData({
          hdfcDenyList
        });
      } else {
        setError({ code: response.status });
      }
    } catch (err) {
      setError({code: 0});
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};
