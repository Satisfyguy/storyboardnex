
import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

interface SigningOverlayProps {
  role: 'INITIATOR' | 'COMPLETER';
  onComplete?: () => void;
}

const SigningOverlay: React.FC<SigningOverlayProps> = ({ role, onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = role === 'INITIATOR' 
      ? [
          { text: '> INITIALIZING WASM MODULE...', delay: 200 },
          { text: '> GENERATING EPHEMERAL KEYS (ED25519)...', delay: 800 },
          { text: '> COMPUTING RING CLSAG SIGNATURES...', delay: 1500 },
          { text: '> ENCRYPTING ALPHA NONCE [CHACHA20]...', delay: 2200 },
          { text: '> TRANSMITTING PARTIAL TX TO RELAY...', delay: 2800 }
        ]
      : [
          { text: '> FETCHING PARTIAL TX FROM RELAY...', delay: 200 },
          { text: '> COMPUTING SHARED SECRET (ECDH)...', delay: 1000 },
          { text: '> DECRYPTING ALPHA NONCE...', delay: 1800 },
          { text: '> VERIFYING TX PREFIX HASH...', delay: 2400 },
          { text: '> BROADCASTING FINALIZED TX...', delay: 3000 }
        ];

    let timeouts: NodeJS.Timeout[] = [];

    // Log Stream
    sequence.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        setLogs(prev => [...prev, text]);
      }, delay);
      timeouts.push(t);
    });

    // Progress Bar
    const progInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progInterval);
          return 100;
        }
        return p + 2; // ~2.5s duration
      });
    }, 50);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progInterval);
    };
  }, [role]);

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-nexus-gold rounded-full animate-pulse"></div>
          <h3 className="font-oswald text-xl uppercase tracking-widest text-nexus-gold">
            {role === 'INITIATOR' ? 'SECURE_SIGNING // PHASE 1' : 'SECURE_SIGNING // PHASE 2'}
          </h3>
        </div>

        {/* Terminal Logs */}
        <div className="h-48 font-mono text-xs text-green-500 space-y-2 p-4 border border-green-900/50 bg-black/50 rounded-xl overflow-hidden shadow-inner">
          {logs.map((log, i) => (
            <div key={i} className="animate-fade-in-up">
              <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
              {log}
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500">
             <span>Encryption Status</span>
             <span>{Math.min(100, Math.floor(progress))}%</span>
          </div>
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-nexus-gold transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
               style={{ width: `${progress}%` }}
             ></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SigningOverlay;
