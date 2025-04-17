// src/components/agent/AgentCard.tsx
import React from 'react';
import { Agent, AgentOverview } from '../../types';
import AgentCardAgent from './AgentCardAgent';
import AgentCardOverview from './AgentCardOverview';


interface AgentCardProps {
  agent: Agent | AgentOverview;
}

function isAgent(agent: Agent | AgentOverview): agent is Agent {
  return 'definition' in agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return isAgent(agent)
    ? <AgentCardAgent agent={agent} />
    : <AgentCardOverview agent={agent} />;
};

export default AgentCard;
