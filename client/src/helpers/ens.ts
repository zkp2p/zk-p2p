import { alchemyMainnetEthersProvider } from "index";


export async function resolveEnsName(ensName: string): Promise<string | null> {
  try {
    const address = await alchemyMainnetEthersProvider.resolveName(ensName);
    if (address === null) {
      return null;
    }
    return address;
  } catch (error) {
    return null;
  }
};
