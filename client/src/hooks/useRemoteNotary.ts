import { useState } from 'react';


type UploadParams = {
  notaryUrl: string;
};

export default function useRemoteNotary({
  notaryUrl,
}: UploadParams) {
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateDummyFile = (): Blob => {
    const size = 4 * 1024 * 1024;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = 0;
    }

    return new Blob([bytes], { type: 'application/octet-stream' });
  };

  const uploadFile = async () => {
    const file = generateDummyFile();
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    const startTime = performance.now();

    try {
      const response = await fetch('https://notary-ap-northeast-1.zkp2p.xyz/api/upload', {
          method: 'POST',
          body: formData
      });

      if (response.ok) {
        const endTime = performance.now();
        const durationSeconds = (endTime - startTime) / 1000;
        const fileSizeInBits = file.size * 8;
        const speedMbps = (fileSizeInBits / durationSeconds) / 1e6;

        setUploadSpeed(speedMbps);
      } else {
        setError(`Failed to upload file. Status: ${response.status}`);
      }
    } catch (err) {
      if (typeof err === 'string') {
        setError(err);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { uploadSpeed, loading, error, uploadFile };
};
