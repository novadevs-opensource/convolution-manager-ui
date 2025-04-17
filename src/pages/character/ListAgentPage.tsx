// src/pages/character/ListAgentPage.tsx
import React, { useState } from 'react';
import { useCharacters } from '../../hooks/useCharacters';
import { Link } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import { Agent } from '../../types';
import { PiSpinnerBallDuotone } from "react-icons/pi";
import { renderClientBadges } from '../../components/agent/AgentCardAgent';
import { formatDateFromString } from '../../utils/character';
import AgentStatus from '../../components/agent/AgentStatus';



const ListAgentPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { agents, loading, error, pagination } = useCharacters(currentPage, 8);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {loading && <p>Loading characters...</p>}
      {error && <p>Error: {error}</p>}
      
      {/* agents list */}
      <div className='p-4 mt-4 bg-white border border-yellow-200 rounded-lg'>
        <div className="w-full flex justify-between items-center mb-6 mt-1">
          <div>
            <h3 className="text-2xl font-anek-latin font-bold text-slate-800 flex flex-row gap-2">Your Agents {loading ? <PiSpinnerBallDuotone className='animate-spin self-center'/> : ''}</h3>
            <p className="text-lg font-afacad text-black">Overview of your agents.</p>
          </div>
        </div>

        <div className="relative flex flex-col w-full h-full overflow-scroll bg-white border justify-between border-beige-200 rounded-lg bg-clip-border min-h-[68vh]">
          <table className="w-full text-left table-auto min-w-max font-anek-latin">
            <thead className='bg-beige-200 text-black'>
              <tr>
                <th className="sm:table-cell hidden p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Avatar
                  </p>
                </th>
                <th className="p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Name
                  </p>
                </th>
                <th className="p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Clients
                  </p>
                </th>
                <th className="p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Status
                  </p>
                </th>
                <th className="sm:table-cell hidden p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Model
                  </p>
                </th>
                <th className="sm:table-cell hidden p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Created at
                  </p>
                </th>
                <th className="sm:table-cell hidden p-4 font-semibold">
                  <p className="text-md font-afacad leading-none">
                    Updated at
                  </p>
                </th>

              </tr>
            </thead>
            <tbody className='bg-beige-50'>
              {agents.map((agent: Agent) => (
                <tr key={agent.id} className="hover:bg-beige-100 border-b border-beige-200">
                  <td className="sm:table-cell hidden p-4 py-2">
                    <Link to={`/agent/${agent.id}`}>
                      {agent.face_image_path ? (
                        <img 
                          className='rounded rounded-full h-10 w-10 hover:opacity-60'
                          src={`${import.meta.env.VITE_AVATAR_BUCKET_BASE_URL}/${agent.face_image_path}`}
                        />
                      ) : (
                        <div className='h-10 w-10 rounded rounded-full p-2 border hover:opacity-60 items-center justify-center flex'>
                          <i className='fa fa-user'></i>
                        </div>
                      )}
                      
                    </Link>
                  </td>
                  <td className="p-4 py-2">
                    <p className="text-sm">
                      <Link to={`/agent/${agent.id}`}>{agent.definition.name}</Link>
                    </p>
                  </td>
                  <td className="p-4 py-2">
                    <p className="text-sm gap-2 flex flex-row">
                      {renderClientBadges(agent.definition.clients)}
                    </p>
                  </td>
                  <td className="p-4 py-2 relative">
                    <AgentStatus id={agent.id} className="absolute top-2 right-4 px-2" />
                  </td>
                  <td className="sm:table-cell hidden p-4 py-2">
                    <p className="text-sm">
                      {agent.definition.settings.secrets.OPENROUTER_MODEL?.split('/')[1]}
                    </p>
                  </td>
                  <td className="sm:table-cell hidden p-4 py-2">
                    <p className="text-sm">
                      {formatDateFromString(agent.created_at)}
                    </p>
                  </td>
                  <td className="sm:table-cell hidden p-4 py-2">
                    <p className="text-sm">
                      {formatDateFromString(agent.updated_at)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} isLoading={loading}/>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListAgentPage;