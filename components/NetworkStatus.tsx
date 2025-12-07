import React, { useState, useEffect } from 'react';
import { NetworkStatus as NetworkStatusType } from '../types';

const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState<NetworkStatusType>({
    nodes: 842,
    latency: 24,
    status: 'OPTIMAL',
    encryption: 'AES-256'
  });

  // Simulate "HTMX polling" every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        nodes: prev.nodes + Math.floor(Math.random() * 5) - 2,
        latency: Math.max(10, prev.latency + Math.floor(Math.random() * 10) - 5),
        status: Math.random() > 0.9 ? 'DEGRADED' : 'OPTIMAL'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none mix-blend-difference">
      <div className="flex flex-col gap-1 text-right">
        <div className="flex items-center justify-end gap-2">
           <span className={`w-2 h-2 rounded-full ${status.status === 'OPTIMAL' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
           <h3 className="text-nexus-text font-oswald text-lg uppercase tracking-widest">Sys_Status</h3>
        </div>
        
        <div className="font-mono text-xs text-nexus-text/70 bg-black/40 p-3 border border-nexus-grid backdrop-blur-md mt-2">
          <div className="flex justify-between gap-8">
            <span>NODES:</span>
            <span className="text-nexus-gold">{status.nodes}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>LATENCY:</span>
            <span className={status.latency > 50 ? 'text-red-400' : 'text-nexus-text'}>{status.latency}ms</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>SEC_PROTO:</span>
            <span className="text-nexus-gold">{status.encryption}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;