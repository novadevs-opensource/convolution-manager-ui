// src/hooks/useAgentAckEvents.ts
import { useAgentEvents } from './useAgentEvents';

interface UseAgentAckEventsProps {
  agentId?: string;
  pollingInterval?: number;
  autoRefreshStatus?: boolean;
}

/**
 * Compatibility layer for useAgentAckEvents that uses the new useAgentEvents internally
 * This allows existing components to continue working without modifications
 * while benefiting from the improved implementation.
 */
export function useAgentAckEvents({
  agentId,
  pollingInterval = 5000,
  autoRefreshStatus = true
}: UseAgentAckEventsProps = {}) {
  // Simply use the new hook with the same parameters
  return useAgentEvents({
    agentId,
    pollingInterval,
    autoRefreshStatus
  });
}