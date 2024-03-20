export type Notarization = {
  proof: string;
  metadata: string;
  date: string;
};

/*
 * Wise Tags
 */

export async function fetchWiseTagNotarizations(): Promise<Notarization[]> {
  return [
    {
      proof: process.env.WISE_TAG_PROOF || '',
      metadata: '@alexanders6341',
      date: '1710571636'
    }
  ];
};

/*
 * Multi Currency Id
 */

export async function fetchMultiCurrencyIdNotarizations(): Promise<Notarization[]> {
  return [
    {
      proof: process.env.MC_ID_PROOF || '',
      metadata: '@my_mc_id',
      date: '1710591636'
    }
  ];
};


/*
 * Transfer
 */

export async function fetchTransferNotarization(): Promise<Notarization[]> {
  return [
    {
      proof: process.env.MC_ID_PROOF || '', // TRANSFER_PROOF
      metadata: '$23 EUR for Alex',
      date: '1710611636'
    }
  ];
};
