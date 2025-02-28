// src/hooks/useRuntimeStatus.ts
import { useState, useEffect, useRef } from 'react';
import api from '../services/apiClient';

// Response interface for the runtime status
export interface RuntimeStatusResponse {
  status: 'running' | 'stopped' | 'unknown' | null;
  last_boot_execution: string | null;
  last_stop_execution: string | null;
  uptime_total_seconds: number;
}

/**
 * Hook to fetch the runtime status of an agent
 * @param id The ID of the agent
 * @param pollingInterval Optional interval in milliseconds for polling (0 = no polling)
 */
export function useRuntimeStatus(id: string, pollingInterval: number = 0) {
  const [statusData, setStatusData] = useState<RuntimeStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Using a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Track if we have an active polling interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch the runtime status
  const fetchRuntimeStatus = async () => {
    if (!id || !isMounted.current) return;
    
    setLoading(true);
    try {
      const { data } = await api.get<RuntimeStatusResponse>(`/runtime/${id}`);
      if (isMounted.current) {
        setStatusData(data);
        setError(null);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Failed to fetch runtime status');
        console.error('Error fetching runtime status:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Effect for initial fetch and setting up polling
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Initial fetch
    fetchRuntimeStatus();
    
    // Setup polling interval if needed
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchRuntimeStatus, pollingInterval);
    }
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, pollingInterval]);

  return { 
    statusData, 
    loading, 
    error, 
    refetch: fetchRuntimeStatus,
    // Helper methods
    isRunning: statusData?.status === 'running',
    isStopped: statusData?.status === 'stopped',
    isUnknown: statusData?.status === 'unknown'
  };
}