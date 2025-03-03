// src/utils/web3/getProvider.ts
import { PhantomProvider } from "../../types/web3";

/**
 * Retrieves the Phantom Provider from the window object
 * @returns {PhantomProvider} a Phantom provider if one exists in the window
 */
const getProvider = (): PhantomProvider => {
  if ('phantom' in window) {
    const anyWindow: any = window;
    const provider = anyWindow.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }

  window.open('https://phantom.app/', '_blank');

  throw new Error("Phantom browser extension is not installed");
  
};

export default getProvider;