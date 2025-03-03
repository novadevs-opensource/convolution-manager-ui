// src/utils/web3/getTokenBalanceAlternative.ts
import axios from 'axios';

interface TokenBalanceResult {
  balance: number;
  decimals: number;
  uiBalance: number;
}

/**
 * Alternative method to get token balance using public APIs instead of direct RPC calls
 * Useful as a fallback when RPC calls fail
 * 
 * @param walletAddress The wallet address to check
 * @param tokenMintAddress The mint address of the token
 * @returns Object containing token balance information
 */
export const getTokenBalanceAlternative = async (
  walletAddress: string,
  tokenMintAddress: string
): Promise<TokenBalanceResult> => {
  try {
    // Try using Solscan API to get tokens
    const response = await axios.get(
      `https://public-api.solscan.io/account/tokens?account=${walletAddress}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    if (response.data && Array.isArray(response.data)) {
      // Find the specific token in the response
      const tokenInfo = response.data.find(
        (token: any) => token.tokenAddress === tokenMintAddress
      );

      if (tokenInfo) {
        return {
          balance: parseFloat(tokenInfo.tokenAmount?.amount || '0'),
          decimals: tokenInfo.tokenAmount?.decimals || 0,
          uiBalance: parseFloat(tokenInfo.tokenAmount?.uiAmount || '0')
        };
      }
    }

    // If Solscan doesn't work, try Helius API as an alternative
    try {
      // You need a Helius API key for this
      const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
      if (HELIUS_API_KEY) {
        const heliusResponse = await axios.post(
          `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`
        );
        
        if (heliusResponse.data && heliusResponse.data.tokens) {
          const token = heliusResponse.data.tokens.find(
            (t: any) => t.mint === tokenMintAddress
          );
          
          if (token) {
            return {
              balance: token.raw,
              decimals: token.decimals,
              uiBalance: token.amount
            };
          }
        }
      }
    } catch (heliusError) {
      console.log('Error with Helius API, continuing with other methods');
    }

    console.log('Token not found in wallet');
    return { balance: 0, decimals: 0, uiBalance: 0 };
  } catch (error) {
    console.error('Error getting balance using alternative API:', error);
    return { balance: 0, decimals: 0, uiBalance: 0 };
  }
};