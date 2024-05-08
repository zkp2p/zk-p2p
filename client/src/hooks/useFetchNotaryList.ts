import { useState } from 'react';


const NOTARY_LIST_URL = 'https://raw.githubusercontent.com/zkp2p/notary-list/main/notaries.json';

export type NotaryConfiguration = {
  name: string;
  notary: string;
  proxy: string;
};

type FetchNotaryListResponse = {
  notaryList: NotaryConfiguration[];
};

type FetchNotaryListError = {
  code: number;
};

export default function useGithubClient() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FetchNotaryListError | null>(null);


  const fetchData = async (): Promise<FetchNotaryListResponse | null> => {
    setLoading(true);
    setError(null);

    const urlWithParams = new URL(NOTARY_LIST_URL);

    try {
      const response = await fetch(urlWithParams.toString(), {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();

        const notaryList = result['notaries'];

        setLoading(false);
        return { notaryList };
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
