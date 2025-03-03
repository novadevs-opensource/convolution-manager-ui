// src/components/PhantomLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../hooks/useToasts';
import { useAuth } from '../hooks/useAuth';
import { loginWithWallet } from '../services/authService';

import getProvider from '../utils/web3/getProvider';
import { getTokenBalance } from '../utils/web3/getTokenBalance';
import { getTokenBalanceAlternative } from '../utils/web3/getTokenBalanceAlternative';

import logo from '../assets/images/Phantom-Icon_Transparent_White.png';
import Button from './common/Button';

const PhantomLogin: React.FC = () => {
  const { addNotification } = useToasts();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

      if (balance.balance > import.meta.env.VITE_MINIMUM_TOKEN_BALANCE) {
        return balance.balance
      }      
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
    }

    throw new Error("Not enough funds!");
  };

  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={connectWallet} 
        label={isLoading ? 'Connecting...' : 'Login with Phantom'}
        disabled={isLoading}
        icon={<img width={24} height={24} src={logo}/>}
        className='bg-phantom hover:!bg-phantom-dark border-phantom hover:border-phantom-dark hover:text-white'
      />
    </div>
  );
};

export default PhantomLogin;