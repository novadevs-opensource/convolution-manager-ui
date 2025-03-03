// src/utils/web3/rpcProviders.ts
export const RPC_ENDPOINTS = {
    // QuickNode endpoints
    RPC_HTTP: import.meta.env.VITE_SOLANA_RPC_ENDPOINT,
    RPC_WSS: import.meta.env.VITE_SOLANA_WS_ENDPOINT,
    
    // Fallback endpoints in case the primary ones fail
    BACKUP_RPCS: [
      'https://ssc-dao.genesysgo.net',
      'https://solana-api.projectserum.com',
      'https://solana-mainnet.rpc.extrnode.com',
      'https://mainnet.rpcpool.com',
    ]
  };
  
  // Function to get the RPC endpoint with preference to configured ones
  export const getRpcEndpoint = (): string => {
    // First try the environment variable if defined
    const envRpc = import.meta.env.VITE_SOLANA_RPC_ENDPOINT;
    if (envRpc) {
      return envRpc;
    }
  
    // Use QuickNode HTTP endpoint by default
    return RPC_ENDPOINTS.RPC_HTTP;
  };
  
  // Function to get WebSocket endpoint
  export const getWsEndpoint = (): string => {
    // First try the environment variable if defined
    const envWs = import.meta.env.VITE_SOLANA_WS_ENDPOINT;
    if (envWs) {
      return envWs;
    }
    
    // Use QuickNode WSS endpoint by default
    return RPC_ENDPOINTS.RPC_WSS;
  };