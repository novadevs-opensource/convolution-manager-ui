// src/main.tsx
import './polyfill'; // Importar primero para asegurar que Buffer esté disponible
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

import './assets/styles/style.scss';
import './assets/styles/index.css';

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { PrivyProvider } from '@privy-io/react-auth';

import { defineChain } from 'viem';

const bscMainnet = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed.binance.org/'],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
});

const bscTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
});



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID}
        config={{
          "appearance": {
            "accentColor": "#6A6FF5",
            "theme": "#FFFFFF",
            "showWalletLoginFirst": true,
            "logo": "/wuai-logo-long-black.svg",
            "walletChainType": "ethereum-only",
            "walletList": [
              //"detected_wallets",
              "metamask",
              //"phantom"
            ]
          },
          "loginMethods": [
            //"email",
            "wallet",
            //"google",
            //"apple",
            //"github",
            //"discord"
          ],
          "fundingMethodConfig": {
            "moonpay": {
              "useSandbox": true
            }
          },
          
          "embeddedWallets": {
            "requireUserPasswordOnCreate": false,
            "showWalletUIs": true,
            "ethereum": {
              //"createOnLogin": "users-without-wallets"
              "createOnLogin": "off"
            },
            /*
            "solana": {
              //"createOnLogin": "users-without-wallets"
              "createOnLogin": "off"
            }
            */
          },
          "mfa": {
            "noPromptOnMfaRequired": false
          },
          defaultChain: bscMainnet,
          supportedChains: [bscMainnet, bscTestnet],
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </PrivyProvider>
    </ErrorBoundary>
  </React.StrictMode>
);


