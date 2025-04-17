// src/utils/web3/getTokenBalance.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getRpcEndpoint } from './rpcProviders';

interface TokenBalanceResult {
  balance: number;
  decimals: number;
  uiBalance: number;
}

/**
 * Gets the token balance for a specific token in the given wallet
 * @param walletAddress The wallet address to check
 * @param tokenMintAddress The mint address of the token
 * @param rpcUrl Optional custom RPC URL
 * @returns Object containing token balance information
 */
export const getTokenBalance = async (
  walletAddress: string, 
  tokenMintAddress: string,
  rpcUrl?: string
): Promise<TokenBalanceResult> => {
  // Use the provided RPC or get it from the rpcProviders utility
  const endpoint = rpcUrl || getRpcEndpoint();
  console.log('Using RPC endpoint:', endpoint);
  const connection = new Connection(endpoint, 'confirmed');

  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // Get the associated token address for this wallet and token
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      walletPublicKey
    );

    // Get token mint information to determine decimals
    const tokenMintInfo = await connection.getParsedAccountInfo(tokenMintPublicKey);
    let decimals = 0;
    
    // Extract decimals information if available
    if (
      tokenMintInfo.value && 
      'parsed' in tokenMintInfo.value.data && 
      tokenMintInfo.value.data.parsed.info.decimals
    ) {
      decimals = tokenMintInfo.value.data.parsed.info.decimals;
    }

    try {
      // Try to get the token account information
      const tokenAccountInfo = await connection.getParsedAccountInfo(tokenAccount);
      
      // If token account exists and has balance information
      if (
        tokenAccountInfo.value && 
        'parsed' in tokenAccountInfo.value.data && 
        tokenAccountInfo.value.data.parsed.info.tokenAmount
      ) {
        const rawBalance = tokenAccountInfo.value.data.parsed.info.tokenAmount.amount;
        const uiBalance = tokenAccountInfo.value.data.parsed.info.tokenAmount.uiAmount || 0;
        
        return {
          balance: Number(rawBalance),
          decimals,
          uiBalance
        };
      }
    } catch (err) {
      console.log('Token account likely does not exist', err);
      // If there's an error finding the token account, it probably doesn't exist (zero balance)
    }
    
    // If account not found or error occurs, return zero balance
    return {
      balance: 0,
      decimals,
      uiBalance: 0
    };
  } catch (error) {
    console.error('Error getting token balance:', error);
    return {
      balance: 0,
      decimals: 0,
      uiBalance: 0
    };
  }
};
