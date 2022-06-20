import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig, Chain } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { RelayProvider } from '@opengsn/provider';
import { ethers, providers } from "ethers";

const anvil: Chain = {
  ...chain.localhost,
  id: 31337,
  name: "Anvil"
}

function SafeHydrate({ children }: any) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}


const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.mainnet,
    chain.polygon,
    chain.optimism,
    chain.arbitrum,
    anvil,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
      ? [chain.goerli, chain.kovan, chain.rinkeby, chain.ropsten]
      : []),
  ],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      alchemyId: 'CTnXza7hp_y2CoC_v5kGb2yO7akMKmYM',
    }),
    publicProvider(),
  ]
);


async function MyApp({ Component, pageProps }: AppProps) {
  const paymasterAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"

  const gsnProvider = await RelayProvider.newProvider({
    provider: window.ethereum as any,
    config: {
      paymasterAddress
    }
  }).init()
  const provider2 = new ethers.providers.Web3Provider(gsnProvider as any as providers.ExternalProvider)

  const { connectors } = getDefaultWallets({
    appName: 'RainbowKit App',
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider: provider2,
    webSocketProvider,
  });

  return (
    <SafeHydrate>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </SafeHydrate>
  );
}

export default MyApp;
