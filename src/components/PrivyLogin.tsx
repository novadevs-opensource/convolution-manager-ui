import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

import { useToasts } from '../hooks/useToasts';
import { useAuth } from '../hooks/useAuth';
import { loginWithWallet } from '../services/authService';

import bnbLogo from '../assets/images/bnb-logo.png';
import Button from './common/Button';
import { getTokenBalanceForCurrentToken } from '../utils/web3/getTokenBalanceForCurrentToken';

const PrivyLogin: React.FC = () => {
  const { addNotification } = useToasts();
  const { login} = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    login: privyLogin,
    authenticated,
    ready,
    user,
    connectWallet,
    logout: privyLogout
  } = usePrivy();

  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      handleSuccessfulConnection(user.wallet.address);
    }
  }, [ready, authenticated, user]);

  const handleSuccessfulConnection = async (address: string) => {
    try {
      setIsLoading(true);

      await checkTokenBalance(address);

      const sessionToken = await loginWithWallet(address);
      login(sessionToken);
      addNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Connection error:', err);
      addNotification(err.message || 'Failed to connect wallet', 'error');
      await privyLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      if (!authenticated) {
        await privyLogin();
      } else if (user && !user.wallet?.address) {
        await connectWallet();
      } else if (user?.wallet?.address) {
        await handleSuccessfulConnection(user.wallet.address);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      addNotification(err.message || 'Failed to login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenBalance = async (address: string): Promise<number> => {
    try {
      //const tokenMintAddress = import.meta.env.VITE_TOKEN_MINT;
      const minBalance = Number(import.meta.env.VITE_MINIMUM_TOKEN_BALANCE || 0);
      const balance = await getTokenBalanceForCurrentToken(address, /*tokenMintAddress*/);

      if (balance.balance >= minBalance) return balance.balance;
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
    }

    throw new Error("Not enough funds!");
  };

  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={handleLogin}
        label={isLoading ? 'Connecting...' : 'Login with BSC Wallet'}
        disabled={isLoading}
        icon={<img width={24} height={24} src={bnbLogo} alt="BNB Logo" className='bg-yellow-500 rounded-full' />}
        className='bg-yellow-500 hover:!bg-black border-yellow-500 hover:border-black hover:text-yellow-500 !rounded text-black'
      />
    </div>
  );
};

export default PrivyLogin;
