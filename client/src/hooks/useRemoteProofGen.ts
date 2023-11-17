import { useState } from 'react';


const REMOTE_PROOF_API_URL = process.env.REMOTE_PROOF_API_URL;
if (!REMOTE_PROOF_API_URL) {
    throw new Error("REMOTE_PROOF_API_URL environment variable is not defined.");
}

type ProofGenParams = {
  emailType: string;
  emailBody: string;
  intentHash: string;
}

type RemoteProofResponse = {
  proof: any;
  public_values: any;
};

type RemoteProofError = {
  code: number;
  message: string;
};

export default function useRemoteProofGen({ emailType, emailBody, intentHash }: ProofGenParams) {
  const [data, setData] = useState<RemoteProofResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<RemoteProofError | null>(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await fetch(REMOTE_PROOF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "email_type": emailType,
          "email": emailBody,
          "intent_hash": intentHash,
        })
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
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
