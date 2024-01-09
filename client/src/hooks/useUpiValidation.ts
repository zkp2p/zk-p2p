import { useState } from 'react';
import crypto from 'crypto';


const VALIDATION_API_URL = process.env.REMOTE_VALIDATE_UPI_URL;
if (!VALIDATION_API_URL) {
  throw new Error("VALIDATION_API_URL environment variable is not defined.");
}

type ValidateUpiParams = {
  vpa: string;
}

type ValidateUpiResponse = {
  input: string;
  accountExists: boolean;
};

type RemoteProofError = {
  code: number;
};

export default function useUpiValidation({ vpa }: ValidateUpiParams) {
  const [data, setData] = useState<ValidateUpiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<RemoteProofError | null>(null);

  const generateNonce = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  const fetchData = async () => {
    setLoading(true);

    const nonce = generateNonce();
    if (!VALIDATION_API_URL) {
      throw new Error("Invalid proving url.");
    }

    const urlWithParams = new URL(VALIDATION_API_URL);
    urlWithParams.searchParams.append("vpa", vpa);
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

        const accountExists = result['data']['account_exists'];

        setData({
          accountExists,
          input: vpa
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
