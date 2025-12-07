
import React, { useState } from 'react';
import { EscrowContract, EscrowStep } from '../types';
import { initiateRoundRobinSign, completeRoundRobinSign } from '../utils/mockBackend';
import SigningOverlay from './SigningOverlay';

interface EscrowActionPanelProps {
  contract: EscrowContract;
  onUpdateStep: (newStep: EscrowStep) => void;
}

const EscrowActionPanel: React.FC<EscrowActionPanelProps> = ({ contract, onUpdateStep }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [signingRole, setSigningRole] = useState<'INITIATOR' | 'COMPLETER'>('INITIATOR');
  
  // Input States
  const [showShippingInput, setShowShippingInput] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState('');
  
  const [showConfirmCheck, setShowConfirmCheck] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // --- ACTIONS ---

  const handleMarkShipped = () => {
    if (!trackingInfo.trim()) return;
    
    setIsProcessing(true);
    // Simulate API call attaching metadata
    setTimeout(() => {
      setIsProcessing(false);
      setShowShippingInput(false);
      onUpdateStep(EscrowStep.SHIPPED);
    }, 1500);
  };

  const handleConfirmReceipt = async () => {
    if (!isConfirmed) return;

    setSigningRole('INITIATOR');
    setIsProcessing(true);
    // Simulate Round-Robin Step 1
    await initiateRoundRobinSign(contract.orderId);
    setIsProcessing(false);
    onUpdateStep(EscrowStep.SIGNATURE_PARTIAL);
  };

  const handleFinalize = async () => {
    setSigningRole('COMPLETER');
    setIsProcessing(true);
    // Simulate Round-Robin Step 2
    await completeRoundRobinSign(contract.orderId);
    setIsProcessing(false);
    onUpdateStep(EscrowStep.COMPLETED);
  };

  const handleDispute = () => {
     if(confirm("WARNING: Raising a dispute will freeze funds and involve a moderator. Are you sure?")) {
        onUpdateStep(EscrowStep.DISPUTE);
     }
  };

  // --- RENDER LOGIC ---

  if (isProcessing && (contract.currentStep === EscrowStep.SHIPPED || contract.currentStep === EscrowStep.SIGNATURE_PARTIAL)) {
    return <SigningOverlay role={signingRole} />;
  }

  return (
    <div className="bg-black/20 border border-nexus-grid/30 rounded-2xl p-6 mt-6 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
      {/* Processing Loader Overlay for non-signing actions */}
      {isProcessing && contract.currentStep === EscrowStep.FUNDS_LOCKED && (
         <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center flex-col gap-2">
            <div className="w-8 h-8 border-2 border-nexus-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="text-nexus-gold font-mono text-xs uppercase animate-pulse">Encrypting Logistics Data...</span>
         </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-nexus-grid/30 pb-2">
        <h4 className="text-nexus-gold font-oswald uppercase tracking-widest text-sm flex items-center gap-2">
           <span className="w-2 h-2 bg-nexus-gold rounded-full animate-pulse"></span>
           Action Required
        </h4>
        <span className="text-[10px] font-mono text-gray-500 bg-black/40 px-2 py-1 rounded">ROLE: {contract.role}</span>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* ================= VENDOR ACTIONS ================= */}
        {contract.role === 'SELLER' && (
          <>
            {/* STEP 1: SHIPPING INPUT */}
            {contract.currentStep === EscrowStep.FUNDS_LOCKED && (
              <div className="space-y-4">
                 {!showShippingInput ? (
                   <button 
                     onClick={() => setShowShippingInput(true)}
                     className="btn-shimmer w-full py-3 bg-nexus-gold text-black font-oswald font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors"
                   >
                     Initiate Shipping Protocol
                   </button>
                 ) : (
                   <div className="bg-black/40 border border-nexus-gold/30 p-4 rounded-xl animate-fade-in-up">
                      <label className="text-[10px] font-mono text-nexus-gold uppercase tracking-wider mb-2 block">
                        Logistics Data / Drop Coordinates (PGP Encrypted)
                      </label>
                      <textarea
                        value={trackingInfo}
                        onChange={(e) => setTrackingInfo(e.target.value)}
                        className="w-full bg-black/60 border border-nexus-grid text-white font-mono text-xs p-3 rounded-lg focus:border-nexus-gold outline-none h-20 resize-none mb-3"
                        placeholder="PASTE ENCRYPTED TRACKING HASH OR COORDINATES..."
                      />
                      <div className="flex gap-2">
                         <button 
                           onClick={() => setShowShippingInput(false)}
                           className="flex-1 py-2 border border-nexus-grid text-gray-500 font-mono text-xs uppercase rounded-full hover:text-white hover:border-white transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={handleMarkShipped}
                           disabled={!trackingInfo}
                           className={`flex-1 py-2 font-oswald font-bold uppercase text-sm rounded-full transition-colors ${!trackingInfo ? 'bg-gray-800 text-gray-600' : 'bg-nexus-gold text-black hover:bg-white'}`}
                         >
                           Confirm Shipment
                         </button>
                      </div>
                   </div>
                 )}
              </div>
            )}
            
            {/* WAITING STATES */}
            {contract.currentStep === EscrowStep.SHIPPING_PENDING && (
               <div className="text-center py-4 text-gray-500 font-mono text-xs uppercase border border-dashed border-gray-700 rounded-xl">
                 Awaiting Logistics Update...
               </div>
            )}

            {contract.currentStep === EscrowStep.SHIPPED && (
              <div className="bg-black/40 border border-nexus-grid p-4 rounded-xl text-center">
                <span className="text-xs font-mono text-gray-400 block mb-2">GOODS IN TRANSIT</span>
                <span className="text-nexus-gold font-bold text-sm uppercase animate-pulse">Awaiting Buyer Confirmation</span>
              </div>
            )}

            {/* STEP 2: FINAL SIGNATURE */}
            {contract.currentStep === EscrowStep.SIGNATURE_PARTIAL && (
              <button 
                onClick={handleFinalize}
                className="btn-shimmer w-full py-4 bg-red-600 text-white font-oswald font-bold uppercase tracking-widest rounded-full hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse flex flex-col items-center leading-none gap-1"
              >
                <span>Countersign & Broadcast</span>
                <span className="text-[10px] font-mono opacity-80">RELEASE FUNDS TO WALLET</span>
              </button>
            )}
          </>
        )}

        {/* ================= BUYER ACTIONS ================= */}
        {contract.role === 'BUYER' && (
          <>
            {contract.currentStep === EscrowStep.FUNDS_LOCKED && (
               <div className="bg-black/40 border border-nexus-grid p-4 rounded-xl text-center">
                 <span className="text-xs font-mono text-gray-400 block mb-2">FUNDS SECURED IN MULTISIG</span>
                 <span className="text-nexus-gold font-bold text-sm uppercase animate-pulse">Awaiting Vendor Shipment</span>
               </div>
            )}

            {/* STEP 1: RECEIPT CONFIRMATION */}
            {contract.currentStep === EscrowStep.SHIPPED && (
              <div className="space-y-4">
                 {!showConfirmCheck ? (
                    <button 
                      onClick={() => setShowConfirmCheck(true)}
                      className="btn-shimmer w-full py-3 bg-nexus-gold text-black font-oswald font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors"
                    >
                      Verify & Accept Goods
                    </button>
                 ) : (
                    <div className="bg-nexus-gold/5 border border-nexus-gold/30 p-4 rounded-xl animate-fade-in-up">
                       <h5 className="font-oswald text-nexus-gold uppercase text-sm mb-3">Release Authorization</h5>
                       <label className="flex items-start gap-3 cursor-pointer group mb-4">
                          <div className={`w-5 h-5 border border-nexus-grid rounded flex items-center justify-center transition-colors mt-0.5 ${isConfirmed ? 'bg-nexus-gold border-nexus-gold' : 'group-hover:border-nexus-gold'}`}>
                             {isConfirmed && <span className="text-black font-bold">✓</span>}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isConfirmed}
                            onChange={() => setIsConfirmed(!isConfirmed)}
                          />
                          <p className="text-[10px] font-mono text-gray-400 leading-tight">
                            I certify that the goods match the manifest description. 
                            <span className="text-white block mt-1">This action will generate a partial signature (Ring CLSAG) and cannot be reversed.</span>
                          </p>
                       </label>
                       
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setShowConfirmCheck(false)}
                           className="flex-1 py-2 border border-nexus-grid text-gray-500 font-mono text-xs uppercase rounded-full hover:text-white hover:border-white transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={handleConfirmReceipt}
                           disabled={!isConfirmed}
                           className={`flex-1 py-2 font-oswald font-bold uppercase text-sm rounded-full transition-colors ${!isConfirmed ? 'bg-gray-800 text-gray-600' : 'bg-nexus-gold text-black hover:bg-white'}`}
                         >
                           Sign Release
                         </button>
                      </div>
                    </div>
                 )}
              </div>
            )}

            {contract.currentStep === EscrowStep.SIGNATURE_PARTIAL && (
              <div className="bg-yellow-900/10 border border-yellow-600/30 p-4 rounded-xl text-center">
                <span className="text-xs font-mono text-yellow-500 block mb-1">PARTIAL SIGNATURE BROADCASTED</span>
                <span className="text-white font-bold text-sm uppercase">Waiting for Vendor Completion</span>
              </div>
            )}
          </>
        )}

        {/* ================= COMPLETED STATE ================= */}
        {contract.currentStep === EscrowStep.COMPLETED && (
          <div className="bg-green-900/10 border border-green-600/30 p-4 rounded-xl text-center">
            <div className="flex justify-center mb-2">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <span className="text-green-500 font-bold text-sm uppercase block">Contract Finalized</span>
            <div className="flex justify-center gap-2 mt-2">
               <span className="text-[10px] font-mono text-gray-500">TX: 0x8a...9f1</span>
               <a href="#" className="text-[10px] font-mono text-nexus-gold hover:underline">VIEW ON EXPLORER</a>
            </div>
          </div>
        )}

        {/* ================= DISPUTE STATE ================= */}
        {contract.currentStep === EscrowStep.DISPUTE && (
           <div className="bg-red-900/10 border border-red-600/50 p-4 rounded-xl text-center animate-pulse">
              <span className="text-red-500 font-oswald text-lg uppercase block mb-1">DISPUTE RAISED</span>
              <span className="text-[10px] font-mono text-gray-400">Moderator has been summoned. Funds frozen.</span>
           </div>
        )}

        {/* ================= SAFETY NET (DISPUTE BUTTON) ================= */}
        {contract.currentStep !== EscrowStep.COMPLETED && contract.currentStep !== EscrowStep.DISPUTE && (
           <div className="pt-4 mt-2 border-t border-nexus-grid/20 flex justify-center">
              <button 
                onClick={handleDispute}
                className="text-[10px] font-mono uppercase text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                 Report Issue / Raise Dispute
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default EscrowActionPanel;
