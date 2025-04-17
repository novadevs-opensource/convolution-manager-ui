// src/utils/web3/getTokenBalance.ts

import { ethers } from 'ethers';

interface TokenBalanceResult {
  balance: number;
  decimals: number;
  uiBalance: number;
}

// ABI mínimo para balanceOf y decimals
const TOKEN_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

/**
 * Gets the token balance for a specific token in the given wallet
 * @param walletAddress The wallet address to check
 * @param tokenMintAddress The mint address of the token
 * @param rpcUrl Optional custom RPC URL
 * @returns Object containing token balance information
 */
export const getTokenBalance = async (
  walletAddress: string, 
  tokenIdentifier: string, // Puede ser 'bnb' o una CA
  rpcUrl: string = 'https://bsc-dataseed.binance.org/'
): Promise<TokenBalanceResult> => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, { name: 'bsc', chainId: 56 });

  try {
    if (!ethers.utils.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Si es BNB nativo
    if (
      tokenIdentifier.toLowerCase() === 'bnb' ||
      tokenIdentifier.toLowerCase() === 'native'
    ) {
      const balance = await provider.getBalance(walletAddress);
      const uiBalance = parseFloat(ethers.utils.formatEther(balance));
      console.log(balance, uiBalance);
      return {
        balance: parseFloat(balance.toString()),
        decimals: 18,
        uiBalance,
      };
    }

    // BEP20 token
    if (!ethers.utils.isAddress(tokenIdentifier)) {
      throw new Error('Invalid token contract address');
    }
    const tokenContract = new ethers.Contract(tokenIdentifier, TOKEN_ABI, provider);
    const decimals = await tokenContract.decimals();
    const rawBalance = await tokenContract.balanceOf(walletAddress);
    const uiBalance = parseFloat(ethers.utils.formatUnits(rawBalance, decimals));

    return {
      balance: parseFloat(rawBalance.toString()),
      decimals,
      uiBalance,
    };
  } catch (error) {
    console.error('Error getting token balance:', error);
    return {
      balance: 0,
      decimals: 0,
      uiBalance: 0,
    };
  }
};
