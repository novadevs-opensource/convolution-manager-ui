// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
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


const DashboardPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { agents, loading, error, pagination } = useCharacters(currentPage);
  const {totalCredits: remainingCredits, totalUsage: totalCreditsUsage, loading: loadingCredits} = useCredits();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {loading && <p>Loading characters...</p>}
      {error && <p>Error: {error}</p>}

      <div className="md:min-w-[700px] xl:min-w-[800px] mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        {/* $CNVLTN balance */}
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <span className="flex items-center text-brand-500 dark:text-white">
                <img src={convolutionLogoBlack} className="h-[24px]" alt="convolution logo"/>
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">$CNVLTN balance</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">TODO</h4>
          </div>
        </div>
        {/* remaining credits */}
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <span className="flex items-center text-brand-500 dark:text-white">
                <LuBadgeCheck size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Open Router credit balance</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{loadingCredits ? '--' : remainingCredits}</h4>
          </div>
        </div>
        {/* used credits */}
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <span className="flex items-center text-brand-500 dark:text-white">
                <LuBadgeAlert size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Open Router used credits</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{loadingCredits ? '--' : totalCreditsUsage}</h4>
          </div>
        </div>
        {/* total uptime */}
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <span className="flex items-center text-brand-500 dark:text-white">
                <MdOutlineTimer size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Total uptime</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">TODO</h4>
          </div>
        </div>
        {/* Total agents */}
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <span className="flex items-center text-brand-500 dark:text-white">
                <MdOutlineSupportAgent size={24} />
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Created agents</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{pagination?.total}</h4>
          </div>
        </div>
        {/* running agents */}
        <div className="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] rounded-[10px] border-[1px] bg-gray-50 border-gray-200 bg-clip-border dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none">
          <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
            <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
              <span className="flex items-center text-brand-500 dark:text-white">
                <IoIosPlay size={24}/>
              </span>
            </div>
          </div>
          <div className="h-50 ml-4 flex w-auto flex-col justify-center">
            <p className="font-dm text-sm font-medium text-gray-600">Running agents</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">TODO</h4>
          </div>
        </div>
      </div>

      <Separator/>

      <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Your agents</h3>
          <p className="text-slate-500">Overview of your created agents.</p>
        </div>
        <div className="ml-3">
          {/* TODO: search */}
        </div>
      </div>

      <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-b border-slate-200 bg-slate-50">
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
              <th className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  Created at
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-normal leading-none text-slate-500">
                  Updated at
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent: Agent) => (
              <tr key={agent.id} className="hover:bg-slate-50 border-b border-slate-200">
                <td className="p-4 py-5">
                  <p className="block font-semibold text-sm text-slate-800">
                    <Link to={`/agent/${agent.id}`}>{agent.id}</Link>
                  </p>
                </td>
                <td className="p-4 py-5">
                  <p className="text-sm text-slate-500">
                    {agent.definition.name}
                  </p>
                </td>
                <td className="p-4 py-5">
                  <p className="text-sm text-slate-500">
                    {agent.definition.clients.map((client: string, index: number) => (
                      <span className='rounded-xl bg-black text-white px-3 py-1' key={index}>{client}</span>
                    ))}
                  </p>
                </td>
                <td className="p-4 py-5">
                  <p className="text-sm text-slate-500">
                    {agent.created_at}
                  </p>
                </td>
                <td className="p-4 py-5">
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