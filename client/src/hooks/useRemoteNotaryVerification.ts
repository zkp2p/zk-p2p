import { useState } from 'react';
import crypto from 'crypto';

import { PaymentPlatformType, PaymentPlatform } from '@helpers/types';


const REMOTE_NOTARY_VERIFICATION_URL = process.env.REMOTE_NOTARY_VERIFICATION_URL;
if (!REMOTE_NOTARY_VERIFICATION_URL) {
    throw new Error("REMOTE_NOTARY_VERIFICATION_URL environment variable is not defined.");
};

type VerificationParams = {
  paymentType: PaymentPlatformType;
  circuitType: string;
  notarization: string;
  intentHash: string;
}

type RemoteNotaryVerificationResponse = {
  proof: any;
  public_values: any;
};

type RemoteNotaryVerificationError = {
  code: number;
  message: string;
};

export default function useRemoteNotaryVerification({ paymentType, circuitType, notarization, intentHash }: VerificationParams) {
  const [data, setData] = useState<RemoteNotaryVerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<RemoteNotaryVerificationError | null>(null);

  const generateNonce = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  const fetchData = async () => {
    setLoading(true);
    const nonce = generateNonce();

    let apiUrl;
    switch (paymentType) {
      case PaymentPlatform.WISE:
        apiUrl = REMOTE_NOTARY_VERIFICATION_URL;
        break

      default:
        throw new Error("Invalid payment type.");
    }
    if (!apiUrl) {
      throw new Error("Invalid verification url.");
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "payment_type": paymentType,
          "circuit_type": circuitType,
          "proof": notarization,
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
