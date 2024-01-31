import { LiFiWidget, WidgetConfig, HiddenUI, DisabledUI } from '@lifi/widget';
import { useMemo } from 'react';
import { useWalletClient } from 'wagmi'
import { providers } from 'ethers'
import { Signer } from 'ethers';

export function walletClientToSigner(walletClient: any) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer as Signer
}
 
/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId })
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  )
}

export const CustomLifiWidget = () => {
  const signer = useEthersSigner();
  console.log("signer", signer)
  
  const widgetConfig: WidgetConfig = useMemo(() => ({
      containerStyle: {
        borderRadius: '12px',
        minWidth: 392,
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
      },
      fromToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      fromChain: 8453,
      walletManagement: {
        signer: signer,
        connect: async () => {
          return signer as Signer
        },
        disconnect: async () => {}
      },
      theme: {
        palette: {
          primary: { main: '#3A3B3F' },
          secondary: { main: '#3A3B3F' }
        },
        shape: {
          borderRadius: 12,
          borderRadiusSecondary: 24,
        },
        typography: {
          fontFamily: 'Graphik',
        }
      },
      appearance: 'dark',
      hiddenUI: [HiddenUI.Appearance, HiddenUI.Language, HiddenUI.PoweredBy],
      disabledUI: [DisabledUI.FromToken],
      integrator: 'ZKP2P'
    }), [signer]);

  return (
    <LiFiWidget integrator="ZKP2P" config={widgetConfig} />
  );
};