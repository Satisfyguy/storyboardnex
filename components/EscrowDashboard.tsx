
import React, { useState, useEffect } from 'react';
import { EscrowContract, EscrowStep } from '../types';
import { generateMockContracts } from '../utils/mockBackend';
import EscrowTimeline from './EscrowTimeline';
import EscrowActionPanel from './EscrowActionPanel';

interface EscrowDashboardProps {
  username: string;
  isVendor: boolean;
}

const EscrowDashboard: React.FC<EscrowDashboardProps> = ({ username, isVendor }) => {
  const [contracts, setContracts] = useState<EscrowContract[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Load mock data
    const data = generateMockContracts(username, isVendor);
    setContracts(data);
    if (data.length > 0) setSelectedId(data[0].id);
  }, [username, isVendor]);

  const selectedContract = contracts.find(c => c.id === selectedId);

  const handleUpdateStep = (id: string, newStep: EscrowStep) => {
    setContracts(prev => prev.map(c => 
      c.id === id ? { ...c, currentStep: newStep } : c
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      
      {/* LEFT: Feed List */}
      <div className="lg:col-span-1 bg-black/40 border border-nexus-grid/50 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
        <div className="p-4 border-b border-nexus-grid/30 bg-black/20">
          <h3 className="font-oswald text-sm uppercase tracking-widest text-white">Active Feeds</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {contracts.map(contract => (
             <button
               key={contract.id}
               onClick={() => setSelectedId(contract.id)}
               className={`w-full text-left p-3 rounded-xl border transition-all ${selectedId === contract.id ? 'bg-nexus-gold/10 border-nexus-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-gray-700'}`}
             >
               <div className="flex justify-between items-start mb-1">
                 <span className={`font-mono text-xs font-bold ${selectedId === contract.id ? 'text-nexus-gold' : 'text-gray-400'}`}>
                   {contract.id}
                 </span>
                 <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                   contract.currentStep === EscrowStep.COMPLETED ? 'border-green-800 text-green-500' : 
                   contract.currentStep === EscrowStep.SIGNATURE_PARTIAL ? 'border-red-800 text-red-500 animate-pulse' :
                   'border-gray-700 text-gray-500'
                 }`}>
                   {EscrowStep[contract.currentStep].split('_')[0]}
                 </span>
               </div>
               <div className="font-oswald text-sm text-white truncate">{contract.listingTitle}</div>
               <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
                 <span>{contract.amount} XMR</span>
                 <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
               </div>
             </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Inspector */}
      <div className="lg:col-span-2 bg-[#1a1b1c]/80 border border-nexus-grid/50 rounded-3xl p-6 backdrop-blur-md flex flex-col relative overflow-hidden">
        {selectedContract ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
               <div className="flex gap-4">
                  <div className="w-16 h-16 bg-black rounded-xl overflow-hidden border border-nexus-grid">
                     <img src={selectedContract.listingImage} alt="" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-oswald uppercase text-white tracking-tight">{selectedContract.listingTitle}</h2>
                     <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
                        <span className="text-nexus-gold">2-of-3 MULTISIG</span>
                        <span>•</span>
                        <span>{selectedContract.multisigAddress.substring(0, 12)}...</span>
                     </div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-oswald text-white">{selectedContract.amount} <span className="text-sm text-nexus-gold">XMR</span></div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Total Locked Value</div>
               </div>
            </div>

            {/* Timeline Visualizer */}
            <div className="mb-6">
               <EscrowTimeline currentStep={selectedContract.currentStep} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-black/30 p-3 rounded-xl border border-nexus-grid/20">
                  <span className="block text-[10px] uppercase text-gray-500 mb-1">Counterparty</span>
                  <span className="font-mono text-sm text-white">{selectedContract.counterparty}</span>
               </div>
               <div className="bg-black/30 p-3 rounded-xl border border-nexus-grid/20">
                  <span className="block text-[10px] uppercase text-gray-500 mb-1">Order ID</span>
                  <span className="font-mono text-sm text-white">{selectedContract.orderId}</span>
               </div>
               <div className="bg-black/30 p-3 rounded-xl border border-nexus-grid/20">
                  <span className="block text-[10px] uppercase text-gray-500 mb-1">Time Locked</span>
                  <span className="font-mono text-sm text-white">{selectedContract.lockedAt ? new Date(selectedContract.lockedAt).toLocaleTimeString() : '-'}</span>
               </div>
               <div className="bg-black/30 p-3 rounded-xl border border-nexus-grid/20">
                  <span className="block text-[10px] uppercase text-gray-500 mb-1">Auto-Release</span>
                  <span className="font-mono text-sm text-red-400">{selectedContract.autoReleaseAt ? new Date(selectedContract.autoReleaseAt).toLocaleDateString() : '-'}</span>
               </div>
            </div>

            {/* Action Panel */}
            <div className="mt-auto">
               <EscrowActionPanel 
                 contract={selectedContract} 
                 onUpdateStep={(step) => handleUpdateStep(selectedContract.id, step)} 
               />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 font-mono text-xs uppercase">
            Select a contract to inspect
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowDashboard;