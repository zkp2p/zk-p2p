import { useState, useEffect } from 'react';


type ProofGenParams = {
  emailType: string;
  emailBody: string;
};

const REMOTE_PROOF_API_URL = process.env.REACT_APP_REMOTE_PROOF_API_URL;

if (!REMOTE_PROOF_API_URL) {
    throw new Error("REMOTE_PROOF_API_URL environment variable is not defined.");
}

export default function useRemoteProofGen({ emailType, emailBody }: ProofGenParams) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(REMOTE_PROOF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailType,
          emailBody
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
