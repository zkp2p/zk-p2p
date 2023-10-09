import { useState } from 'react';


const REMOTE_PROOF_API_URL = process.env.REMOTE_PROOF_API_URL;
if (!REMOTE_PROOF_API_URL) {
    throw new Error("REMOTE_PROOF_API_URL environment variable is not defined.");
}

type ProofGenParams = {
  emailType: string;
  emailBody: string;
  orderId: string;
}

type RemoteProofResponse = {
  proof: any;
  public_values: any;
};

export default function useRemoteProofGen({ emailType, emailBody, orderId }: ProofGenParams) {
  const [data, setData] = useState<RemoteProofResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
          "email_type": emailType,
          "email": emailBody,
          "order_id": orderId,
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
