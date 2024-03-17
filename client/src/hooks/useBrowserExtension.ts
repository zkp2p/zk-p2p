export type WiseTagNotarization = {
  proof: string;
  tag: string;
  date: string;
};

export async function fetchWiseTagNotarizations(): Promise<WiseTagNotarization[]> {
  return [
    {
      proof: process.env.WISE_TAG_PROOF || '',
      tag: '@alexanders6341',
      date: '1710571636'
    }
  ];
};
