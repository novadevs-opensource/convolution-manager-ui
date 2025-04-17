// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { MdOutlineTimer } from "react-icons/md";
import { MdOutlineSupportAgent } from "react-icons/md";
import { IoIosPlay } from "react-icons/io";
import { PiSpinnerBallDuotone } from "react-icons/pi";
import wuaiLogoWhite from '../assets/images/wuai-logo.svg';

import { Agent } from '../types';

import { useCharacters } from '../hooks/useCharacters';
import { useFeaturedAgents } from '../hooks/useFeaturedAgents';
import { useAuth } from '../hooks/useAuth';


import { formatSeconds } from '../utils/character';
import { getTokenBalanceForCurrentToken } from '../utils/web3/getTokenBalanceForCurrentToken';

import MasonryAgentsLayout from '../components/agent/MasonryAgentsLayout';

const DashboardPage: React.FC = () => {
  const {agents: allAgents, loading: loadingAllAgents} = useCharacters(1, 1000);
  const {agents: featuredAgents, loading: loadingFeaturedAgents} = useFeaturedAgents();
  //const {totalCredits: remainingCredits, totalUsage: totalCreditsUsage, loading: loadingCredits} = useCredits();
  const { userProfile } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [totalUptime, setTotalUptime] = useState<number>();
  const [runningAgents, setRunningAgents] = useState<number>();

  // Fetch token balance when wallet address changes.
  useEffect(() => {
    const fetchBalance = async () => {
      if (userProfile?.wallet_address) {
        // Ensure the mint address is a string from your environment variables.
        const balance = await getTokenBalanceForCurrentToken(userProfile.wallet_address);
        setTokenBalance(balance.uiBalance);
      }
    };
    fetchBalance();
  }, [userProfile?.wallet_address]);

  useEffect(() => {
    if (allAgents.length > 0) {
      setTotalUptime(allAgents.reduce((accumulator, current: Agent) => accumulator + current.uptime_total_seconds, 0))
      setRunningAgents(allAgents.filter((agent: Agent) => agent.status === 'running').length);
    }
  }, [allAgents]);

  return (
    <div>
      {loadingAllAgents || loadingFeaturedAgents && <p>Loading characters...</p>}
      
       {/* metrics & live trading */}
      <div className='flex flex-col sm:flex-row justify-center items-stretch gap-4'>
        {/* metrics */}
        <div className='sm:w-1/3'>
          <div className='p-4 w-full bg-white rounded-lg'>
            <div className="w-full flex justify-between items-center mb-6 mt-1">
              <div>
                <h3 className="text-2xl font-anek-latin font-bold text-slate-800 flex flex-row gap-2">Metrics {loadingAllAgents ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : ''}</h3>
                <p className="text-lg font-afacad text-black">Quick data about your token balance and your agents.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* token balance */}
              <div className="rounded-lg flex flex-col items-center py-10 bg-beige-200">
                <div className="flex w-auto flex-row items-center">
                  <div className="rounded-full p-3">
                    <span className="flex items-center">
                      <img src={wuaiLogoWhite} className="h-[32px]" alt="wuai logo"/>
                    </span>
                  </div>
                </div>
                <div className="flex w-auto flex-col justify-center text-black items-center">
                  <p className="text-sm font-anek-latin">$WUAI balance</p>
                  <h4 className="text-xl font-bold font-anek-latin">{tokenBalance}</h4>
                </div>
              </div>
              {/* total uptime */}
              <div className="rounded-lg flex flex-col items-center py-10 bg-beige-200">
                <div className="flex w-auto flex-row items-center">
                  <div className="rounded-full bg-lightPrimary p-3 ">
                    <span className="flex items-center">
                      <MdOutlineTimer size={32} />
                    </span>
                  </div>
                </div>
                <div className="flex w-auto flex-col justify-center items-center">
                  <p className="text-sm font-medium font-anek-latin">Total uptime</p>
                  <h4 className="text-xl font-bold font-anek-latin">{loadingAllAgents ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : formatSeconds(totalUptime ?? 0, false)}</h4>
                </div>
              </div>
              {/* Total agents */}
              <div className="rounded-lg flex flex-col items-center py-10 bg-beige-200">
                <div className="flex w-auto flex-row items-center">
                  <div className="rounded-full bg-lightPrimary p-3 ">
                    <span className="flex items-center">
                      <MdOutlineSupportAgent size={32} />
                    </span>
                  </div>
                </div>
                <div className="flex w-auto flex-col justify-center items-center">
                  <p className="text-sm font-medium font-anek-latin">Created Agents</p>
                  <h4 className="text-xl font-bold font-anek-latin">{allAgents?.length}</h4>
                </div>
              </div>
              {/* running agents */}
              <div className="rounded-lg flex flex-col items-center py-10 bg-beige-200">
                <div className="flex w-auto flex-row items-center">
                  <div className="rounded-full bg-lightPrimary p-3 ">
                    <span className="flex items-center">
                      <IoIosPlay size={32}/>
                    </span>
                  </div>
                </div>
                <div className="flex w-auto flex-col justify-center items-center">
                  <p className="text-sm font-medium font-anek-latin">Running Agents</p>
                  <h4 className="text-xl font-bold font-anek-latin">{loadingAllAgents ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : runningAgents ?? 0}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* live trading */}
        <div className="p-4 w-full sm:w-2/3 bg-white rounded-lg flex flex-col">
          <div className="w-full flex justify-between items-center mb-6 mt-1">
            <div>
              <h3 className="text-2xl font-anek-latin font-bold text-slate-800 flex flex-row gap-2">Live trading</h3>
              <p className="text-lg font-afacad text-black">Showing $WUAI/WBNB Price Chart in BSC.</p>
            </div>
          </div>
          <div className="w-full h-96 sm:h-auto flex-grow">
            <iframe id="dextools-widget"
              title="DEXTools Trading Chart"
              src="https://www.dextools.io/widget-chart/en/ether/pe-light/0x9e7809c21ba130c1a51c112928ea6474d9a9ae3c?theme=dark&chartType=1&chartResolution=240&drawingToolbars=false&headerColor=000000&tvPaneColor=000&tvPlatformColor=000"
              className='w-full h-full rounded-lg'
            />
            {/*
            <iframe className='w-full h-full rounded-lg' src="https://dexscreener.com/solana/9UMuN94bbuH53F4PTVWDYZoQjsJ3zgEx2j2vtT5Rbo1x?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"></iframe>
            */}

          </div>
        </div>

      </div>

      {/* featured list */}
      <div className='p-4 mt-4 bg-white rounded-lg'>
        <div className="w-full flex justify-between items-center mb-6 mt-1">
          <div>
            <h3 className="text-2xl font-anek-latin font-bold text-slate-800 flex flex-row gap-2">Featured Agents {loadingFeaturedAgents ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : ''}</h3>
            <p className="text-lg font-afacad text-black">Overview of the most popular Agents.</p>
          </div>
        </div>

        <MasonryAgentsLayout 
            agents={featuredAgents}
            columns={4}
            // Optional: uncomment if you want scrolling container
            // scroll={true}
            // scrollSize={600}
        />
      </div>
    </div>
  );
};

export default DashboardPage;