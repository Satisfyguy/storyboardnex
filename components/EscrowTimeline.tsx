
import React from 'react';
import { EscrowStep } from '../types';

interface EscrowTimelineProps {
  currentStep: EscrowStep;
}

const STEPS = [
  { step: EscrowStep.FUNDS_LOCKED, label: 'LOCKED' },
  { step: EscrowStep.SHIPPED, label: 'SHIPPED' },
  { step: EscrowStep.SIGNATURE_PARTIAL, label: 'PARTIAL SIG' },
  { step: EscrowStep.COMPLETED, label: 'RELEASED' },
];

const EscrowTimeline: React.FC<EscrowTimelineProps> = ({ currentStep }) => {
  // Calculate progress percentage for the line
  const progressIndex = STEPS.findIndex(s => s.step === currentStep);
  // If currentStep is not in the simplified view (e.g. AWAITING_DEPOSIT), handle gracefully
  const activeIdx = progressIndex === -1 ? (currentStep === EscrowStep.COMPLETED ? 3 : 0) : progressIndex;
  
  const progressPercent = (activeIdx / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full py-6">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-nexus-gold -translate-y-1/2 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          style={{ width: `${progressPercent}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between w-full">
          {STEPS.map((s, idx) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step || currentStep === EscrowStep.COMPLETED;
            
            return (
              <div key={s.step} className="flex flex-col items-center gap-2 group cursor-default">
                <div 
                  className={`
                    w-4 h-4 rounded-full border-2 z-10 transition-all duration-300
                    ${isActive ? 'bg-nexus-gold border-nexus-gold scale-125 shadow-[0_0_15px_rgba(212,175,55,0.8)]' : ''}
                    ${isCompleted ? 'bg-nexus-gold border-nexus-gold' : ''}
                    ${!isActive && !isCompleted ? 'bg-[#1a1b1c] border-gray-600' : ''}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-nexus-gold rounded-full animate-ping opacity-75"></div>
                  )}
                </div>
                <span 
                  className={`
                    absolute top-6 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-colors
                    ${isActive ? 'text-nexus-gold font-bold' : 'text-gray-600'}
                  `}
                  style={{ 
                    left: idx === 0 ? '0%' : (idx === STEPS.length -1 ? 'auto' : '50%'), 
                    right: idx === STEPS.length -1 ? '0%' : 'auto',
                    transform: (idx !== 0 && idx !== STEPS.length -1) ? 'translateX(-50%)' : 'none'
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EscrowTimeline;