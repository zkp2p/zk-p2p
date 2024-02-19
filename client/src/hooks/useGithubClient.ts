import { useState } from 'react';
import crypto from 'crypto';

type FetchDenyListResponse = {
  denyList: string[];
};

type FetchDenyListError = {
  code: number;
};

export default function useGithubClient() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FetchDenyListError | null>(null);

  const generateNonce = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  const fetchData = async (url: string): Promise<FetchDenyListResponse | null> => {
    setLoading(true);
    setError(null);

    const nonce = generateNonce();

    const urlWithParams = new URL(url);
    urlWithParams.searchParams.append("nonce", nonce);

    try {
      const response = await fetch(urlWithParams.toString(), {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();

        const denyList = result['depositors'];

        setLoading(false);
        return { denyList };
      } else {
        setError({ code: response.status });

        setLoading(false);

        return null;
      }
    } catch (err) {
      setError({code: 0});

      setLoading(false);

      return null;
    }
  };

  return { loading, error, fetchData };
};
