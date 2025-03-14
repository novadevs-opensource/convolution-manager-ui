// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { Link } from 'react-router-dom';
import Pagination from '../components/common/Pagination';
import Separator from '../components/common/Separator';
import { Agent } from '../types';
import { useCredits } from '../hooks/useCredits';
import convolutionLogoBlack from '../assets/images/convolution-square-black.svg';
import { LuBadgeAlert } from "react-icons/lu";
import { LuBadgeCheck } from "react-icons/lu";
import { MdOutlineTimer } from "react-icons/md";
import { MdOutlineSupportAgent } from "react-icons/md";
import { IoIosPlay } from "react-icons/io";
import { getTokenBalance } from '../utils/web3/getTokenBalance';
import { useAuth } from '../hooks/useAuth';
import { formatSeconds } from '../utils/character';
import { PiSpinnerBallDuotone } from "react-icons/pi";



const DashboardPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { agents, loading, error, pagination } = useCharacters(currentPage);
  const {agents: allAgents, loading: loadingAllAgents} = useCharacters(1, 1000);
  const {totalCredits: remainingCredits, totalUsage: totalCreditsUsage, loading: loadingCredits} = useCredits();
  const { userProfile } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [totalUptime, setTotalUptime] = useState<number>();
  const [runningAgents, setRunningAgents] = useState<number>();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch token balance when wallet address changes.
  useEffect(() => {
    const fetchBalance = async () => {
      if (userProfile?.wallet_address) {
        // Ensure the mint address is a string from your environment variables.
        const balance = await getTokenBalance(
          userProfile.wallet_address,
          import.meta.env.VITE_TOKEN_MINT as string
        );
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
      {loading && <p>Loading characters...</p>}
      {error && <p>Error: {error}</p>}

      <div className="md:min-w-[700px] xl:min-w-[800px] mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        {/* $CNVLTN balance */}
        <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3">
              <span className="flex items-center text-brand-500">
                <img src={convolutionLogoBlack} className="h-[24px]" alt="convolution logo"/>
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">$CNVLTN balance</p>
            <h4 className="text-xl font-bold text-navy-700">{tokenBalance}</h4>
          </div>
        </div>
        {/* remaining credits */}
        <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 ">
              <span className="flex items-center text-brand-500 ">
                <LuBadgeCheck size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Open Router credit balance</p>
            <h4 className="text-xl font-bold text-navy-700 ">{loadingCredits ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : remainingCredits}</h4>
          </div>
        </div>
        {/* used credits */}
        <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 ">
              <span className="flex items-center text-brand-500 ">
                <LuBadgeAlert size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Open Router used credits</p>
            <h4 className="text-xl font-bold text-navy-700 ">{loadingCredits ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : totalCreditsUsage}</h4>
          </div>
        </div>
        {/* total uptime */}
        <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 ">
              <span className="flex items-center text-brand-500 ">
                <MdOutlineTimer size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Total uptime</p>
            <h4 className="text-xl font-bold text-navy-700 w-full flex flex-row">{loadingAllAgents ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : formatSeconds(totalUptime ?? 0, false)}</h4>
          </div>
        </div>
        {/* Total agents */}
        <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border ">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 ">
              <span className="flex items-center text-brand-500 ">
                <MdOutlineSupportAgent size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Created agents</p>
            <h4 className="text-xl font-bold text-navy-700 ">{pagination?.total}</h4>
          </div>
        </div>
        {/* running agents */}
        <div className="shadow-md relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border ">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 ">
              <span className="flex items-center text-brand-500 ">
                <IoIosPlay size={24}/>
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Running agents</p>
            <h4 className="text-xl font-bold text-navy-700 ">{loadingAllAgents ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : runningAgents}</h4>
          </div>
        </div>
      </div>

      <Separator/>

      <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex flex-row gap-2">Your vInfluencers {loading ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : ''}</h3>
          <p className="text-slate-500">Overview of your created vInfluencers.</p>
        </div>
        <div className="ml-3">
          {/* TODO: search */}
        </div>
      </div>

      <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="sm:table-cell hidden p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  ID
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  Name
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  Clients
                </p>
              </th>
              <th className="sm:table-cell hidden p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  Created at
                </p>
              </th>
              <th className="sm:table-cell hidden p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  Updated at
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent: Agent) => (
              <tr key={agent.id} className="hover:bg-slate-50 border-b border-slate-200">
                <td className="sm:table-cell hidden p-4 py-2">
                  <p className="block font-semibold text-sm text-slate-800">
                    <Link to={`/agent/${agent.id}`}>{agent.id}</Link>
                  </p>
                </td>
                <td className="p-4 py-2">
                  <p className="text-sm text-slate-500">
                    <Link to={`/agent/${agent.id}`}>{agent.definition.name}</Link>
                  </p>
                </td>
                <td className="p-4 py-2">
                  <p className="text-sm text-slate-500 gap-2 flex flex-row">
                    {agent.definition.clients.map((client: string, index: number) => (
                      <span className='rounded-xl bg-black text-white px-3 py-1' key={index}>{client}</span>
                    ))}
                  </p>
                </td>
                <td className="sm:table-cell hidden p-4 py-2">
                  <p className="text-sm text-slate-500">
                    {agent.created_at}
                  </p>
                </td>
                <td className="sm:table-cell hidden p-4 py-2">
                  <p className="text-sm text-slate-500">
                    {agent.updated_at}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Usamos el nuevo componente de paginación */}
        {pagination && (
          <Pagination pagination={pagination} onPageChange={handlePageChange} isLoading={loading}/>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;