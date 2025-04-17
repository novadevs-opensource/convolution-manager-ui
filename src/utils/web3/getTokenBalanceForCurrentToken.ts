// src/utils/web3/getTokenBalanceForCurrentToken.ts

import { getTokenBalance } from './getTokenBalance';

/**
 * Wrapper que usa el token definido en VITE_TOKEN_MINT
 * @param walletAddress Dirección del usuario
 */
export const getTokenBalanceForCurrentToken = async (walletAddress: string) => {
  const tokenIdentifier = import.meta.env.VITE_TOKEN_MINT;

  if (!tokenIdentifier) {
    console.warn('VITE_TOKEN_MINT is not defined in your environment variables.');
    return {
      balance: 0,
      decimals: 0,
      uiBalance: 0,
    };
  }

  return await getTokenBalance(walletAddress, tokenIdentifier);
};
