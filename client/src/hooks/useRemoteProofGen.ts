import { useState } from 'react';
import crypto from 'crypto';

import { PaymentPlatformType, PaymentPlatform } from '@helpers/types';


const REMOTE_PROOF_API_URL = process.env.REMOTE_PROOF_API_URL;
if (!REMOTE_PROOF_API_URL) {
    throw new Error("REMOTE_PROOF_API_URL environment variable is not defined.");
}

const REMOTE_PROOF_UPI_API_URL = process.env.REMOTE_PROOF_UPI_API_URL;
if (!REMOTE_PROOF_UPI_API_URL) {
    throw new Error("REMOTE_PROOF_UPI_API_URL environment variable is not defined.");
}

type ProofGenParams = {
  paymentType: PaymentPlatformType;
  circuitType: string;
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

export default function useRemoteProofGen({ paymentType, circuitType, emailBody, intentHash }: ProofGenParams) {
  const [data, setData] = useState<RemoteProofResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<RemoteProofError | null>(null);

  const generateNonce = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  const fetchData = async () => {
    setLoading(true);

    const nonce = generateNonce();
    const apiUrl = paymentType === PaymentPlatform.VENMO ? REMOTE_PROOF_API_URL : REMOTE_PROOF_UPI_API_URL;
    if (!apiUrl) {
      throw new Error("Invalid proving url.");
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "payment_type": paymentType,
          "email_type": circuitType, // legacy_parameter
          "circuit_type": circuitType,
          "email": emailBody,
          "intent_hash": intentHash,
          "nonce": nonce,
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
        setError(err as any);
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};
