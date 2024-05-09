import { useState } from 'react';


const UPLOAD_SIZE_BYTES = 4.9 * 1024 * 1024;

type UploadParams = {
  notaryUrl: string;
};

export default function useRemoteNotaryUploadTest({
  notaryUrl,
}: UploadParams) {
  const [uploadTime, setUploadTime] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateDummyFile = (): Blob => {
    const size = UPLOAD_SIZE_BYTES;
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
      const response = await fetch(`${notaryUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Connection': 'close',
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        const endTime = performance.now();
        const durationSeconds = (endTime - startTime) / 1000;

        setUploadTime(durationSeconds);
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

  return { uploadTime, loading, error, uploadFile };
};
