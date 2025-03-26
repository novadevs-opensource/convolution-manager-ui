import React, { useState, useEffect, useCallback } from 'react';
import { FaCircle } from 'react-icons/fa';

interface AgentLoaderProps {
  // Start time of the launch (ISO string or timestamp)
  timeFrom: string;
  // Total duration in seconds to reach 100% (default: 360s = 6min)
  durationSeconds?: number;
  // Force 100% progress regardless of elapsed time
  forceComplete?: boolean;
  // Customize loading text
  loadingText?: string;
  // Optional callback when loading completes
  onComplete?: () => void;
}

const AgentLoader: React.FC<AgentLoaderProps> = ({
  timeFrom,
  durationSeconds = 360,
  forceComplete = false,
  loadingText = "Launching agent",
  onComplete
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Calculate progress based on elapsed time
  const calculateProgress = useCallback(() => {
    try {
      // Convert start time to timestamp if it's an ISO string
      const startTime = new Date(timeFrom).getTime();
      const currentTime = Date.now();
      const elapsedTimeMs = currentTime - startTime;
      const totalDurationMs = durationSeconds * 1000;
      
      // Calculate progress percentage (0-100) with higher precision
      const calculatedProgress = Math.min(100, (elapsedTimeMs / totalDurationMs) * 100);
      
      // Return progress with more precision (don't floor it yet)
      return calculatedProgress;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  }, [timeFrom, durationSeconds]);

  useEffect(() => {
    // If force complete is true, immediately set to 100%
    if (forceComplete) {
      setProgress(100);
      setIsCompleted(true);
      if (onComplete) onComplete();
      return;
    }

    // Update progress every 100ms for smooth animation
    const interval = setInterval(() => {
      const currentProgress = calculateProgress();
      setProgress(currentProgress);
      
      // If completed (reached 100%), clear interval and call callback
      if (currentProgress >= 100 && !isCompleted) {
        setIsCompleted(true);
        if (onComplete) onComplete();
        clearInterval(interval);
      }
    }, 100);
    
    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [calculateProgress, forceComplete, onComplete, isCompleted]);
  
  // Define colors for different segments of the progress bar
  const getSegments = () => {
    if (progress <= 30) {
      return [{ width: `${progress}%`, color: 'bg-purple-500' }];
    } else if (progress <= 60) {
      return [
        { width: '30%', color: 'bg-purple-500' },
        { width: `${progress - 30}%`, color: 'bg-gradient-primary' }
      ];
    } else {
      return [
        { width: '30%', color: 'bg-purple-500' },
        { width: '30%', color: 'bg-gradient-primary' },
        { width: `${progress - 60}%`, color: 'bg-gradient-secondary' }
      ];
    }
  };
  
  const segments = getSegments();
  
  // Format progress with two decimal places
  const displayProgress = progress.toFixed(2);
  
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <div className={`size-fit border flex inline-flex px-4 py-1 rounded-full border-gray-200 bg-white items-center gap-2 uppercase`}>
            <span className='text-black-light text-xs'>
              {loadingText}
            </span>
            <span className={`text-orange-400 ${isCompleted ? 'animate-pulse' : 'animate-ping'}`}>
              <FaCircle />
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-black">
            {displayProgress}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        {segments.map((segment, index) => (
          <div 
            key={index}
            style={{ width: segment.width }} 
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${segment.color}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AgentLoader;