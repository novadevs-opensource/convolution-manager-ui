import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

import { useToasts } from '../hooks/useToasts';
import { useAuth } from '../hooks/useAuth';
import { loginWithWallet } from '../services/authService';

import getProvider from '../utils/web3/getProvider';
import { getTokenBalance } from '../utils/web3/getTokenBalance';
import { getTokenBalanceAlternative } from '../utils/web3/getTokenBalanceAlternative';

import logo from '../assets/images/Phantom-Icon_Transparent_White.png';
import Button from './common/Button';

// Extend the global Window interface to include solana
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (args?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
  }
}

const PhantomLogin: React.FC = () => {
  const { addNotification } = useToasts();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile browsers and process callback if present
  useEffect(() => {
    const mobileRegex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsMobile(mobileRegex.test(navigator.userAgent));

    // Check if we are returning from a Phantom mobile deep link callback
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');
    if (payload) {
      (async () => {
        try {
          setIsLoading(true);
          // Retrieve the phantom encryption public key from the URL
          const phantomEncryptionPublicKey = params.get('phantom_encryption_public_key');
          if (!phantomEncryptionPublicKey) {
            throw new Error('Missing phantom encryption public key in callback');
          }
          // Retrieve the secret key stored earlier
          const storedSecretKey = localStorage.getItem('phantom_dapp_secret_key');
          if (!storedSecretKey) {
            throw new Error('Missing dApp secret key');
          }

          // Decode keys and payload
          const dappSecretKey = bs58.decode(storedSecretKey);
          const phantomEncryptionPubKey = bs58.decode(phantomEncryptionPublicKey);
          const decodedPayload = naclUtil.decodeBase64(payload);
          const nonce = decodedPayload.slice(0, 24);
          const ciphertext = decodedPayload.slice(24);
          const decrypted = nacl.box.open(ciphertext, nonce, phantomEncryptionPubKey, dappSecretKey);
          if (!decrypted) {
            throw new Error('Failed to decrypt payload');
          }
          const decryptedString = naclUtil.encodeUTF8(decrypted);
          const data = JSON.parse(decryptedString);
          const walletPublicKey = data.public_key;
          if (!walletPublicKey) {
            throw new Error('Wallet public key not found in decrypted payload');
          }

          console.log('Decrypted wallet public key:', walletPublicKey);
          // Aquí podrías realizar acciones adicionales (verificar saldo, login, etc.)
          navigate('/dashboard');

          // Clean up the URL and local storage
          window.history.replaceState({}, document.title, window.location.pathname);
          localStorage.removeItem('phantom_dapp_secret_key');
        } catch (err: any) {
          console.error('Error processing Phantom callback:', err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [navigate]);

  // Desktop connection using injected provider (window.solana)
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      
      // After connecting, fetch token balance
      await checkTokenBalance(address);

      const sessionToken = await loginWithWallet(address);
      login(sessionToken);
      addNotification('Login successful!', 'success');
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Connection error:', err);
      addNotification(err.message || 'Failed to connect wallet', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  // Mobile connection using deep linking
  const connectWalletMobile = async () => {
    try {
      setIsLoading(true);
      // Genera un par de claves de cifrado
      const keypair = nacl.box.keyPair();
      const dappEncryptionPublicKey = bs58.encode(keypair.publicKey);
      // Guarda la clave secreta para usarla en el callback
      localStorage.setItem('phantom_dapp_secret_key', bs58.encode(keypair.secretKey));

      // Usa la URL actual (/login) como redirect URL
      const redirectUrl = encodeURIComponent(window.location.origin + window.location.pathname);
      const cluster = 'mainnet-beta'; // o 'devnet' según tu entorno

      // Construye la URL de deep link
      const deepLinkUrl = `https://phantom.app/ul/v1/connect?dapp_encryption_public_key=${encodeURIComponent(
        dappEncryptionPublicKey
      )}&redirect_url=${redirectUrl}&cluster=${cluster}`;
      console.log('Deep link URL:', deepLinkUrl);
      // Redirige al usuario a la app Phantom
      window.location.href = deepLinkUrl;
    } catch (err: any) {
      console.error('Mobile deep link error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenBalance = async (address: string): Promise<number> => {
    try {
      const tokenMintAddress = import.meta.env.VITE_TOKEN_MINT;
      const balance = await getTokenBalance(address, tokenMintAddress);
      
      // If balance is 0, try alternative method as fallback
      if (balance.balance === 0) {
        try {
          const altBalance = await getTokenBalanceAlternative(address, tokenMintAddress);          
          if (altBalance.balance > import.meta.env.VITE_MINIMUM_TOKEN_BALANCE) {;
            return altBalance.balance;
          }
        } catch (altError) {
          console.error('Error using alternative method:', altError);
        }
      }

      if (balance.balance >= import.meta.env.VITE_MINIMUM_TOKEN_BALANCE) {
        return balance.balance
      }      
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
    }

    throw new Error("Not enough funds!");
  };

  return (
    <div className="flex flex-col gap-4">
      {isMobile ? (
        <Button 
          onClick={connectWalletMobile}
          label={isLoading ? 'Connecting...' : 'Login with Phantom'}
          disabled={isLoading}
          icon={<img width={24} height={24} src={logo}/>}
          className='bg-phantom hover:!bg-phantom-dark border-phantom hover:border-phantom-dark hover:text-white'
        >
        </Button>
      ) : (
        <Button 
          onClick={connectWallet}
          label={isLoading ? 'Connecting...' : 'Login with Phantom'}
          disabled={isLoading}
          icon={<img width={24} height={24} src={logo}/>}
          className='!bg-phantom hover:!bg-phantom-dark !rounded !border-phantom hover:!border-phantom-dark !text-white'
        >
        </Button>
      )}
    </div>
  );
};

export default PhantomLogin;
