
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ListingItem, AuthState, OrderState } from '../types';
import { initiateRoundRobinSign, completeRoundRobinSign } from '../utils/mockBackend';
import SigningOverlay from './SigningOverlay';

interface ListingDetailsModalProps {
  item: ListingItem;
  auth: AuthState;
  onAuthRequest: () => void;
  onClose: () => void;
  onAddToBag: (item: ListingItem) => void;
}

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({ item, auth, onAuthRequest, onClose, onAddToBag }) => {
  const [orderState, setOrderState] = useState<OrderState>(item.status || OrderState.IDLE);
  const [isSigning, setIsSigning] = useState(false);
  const [signingRole, setSigningRole] = useState<'INITIATOR' | 'COMPLETER'>('INITIATOR');
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initial Animation
  useEffect(() => {
    const tl = gsap.timeline();
    tl.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      .fromTo(contentRef.current, 
        { y: 100, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, "-=0.2"
      );
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(contentRef.current, { y: 50, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' })
      .to(overlayRef.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  };

  const handleAddToBag = () => {
    if (!auth.isAuthenticated) {
      onAuthRequest();
      return;
    }
    onAddToBag(item);
    handleClose();
  };

  // --- ROUND ROBIN FLOW HANDLERS ---
  const handleInitiateRelease = async () => {
    setSigningRole('INITIATOR');
    setIsSigning(true);
    
    // Simulate Backend/WASM delay
    await initiateRoundRobinSign(item.id);
    
    setIsSigning(false);
    setOrderState(OrderState.SIGNING_INITIATED);
  };

  const handleFinalizeSignature = async () => {
    setSigningRole('COMPLETER');
    setIsSigning(true);

    // Simulate Backend/WASM delay
    await completeRoundRobinSign(item.id);

    setIsSigning(false);
    setOrderState(OrderState.FINALIZED);
  };

  const renderActionButton = () => {
    if (!auth.isAuthenticated) {
      return (
        <button onClick={handleAddToBag} className="btn-shimmer flex-1 bg-nexus-gold text-black font-oswald font-bold text-xl uppercase py-4 tracking-widest hover:bg-white transition-colors rounded-full">
          Login to Trade
        </button>
      );
    }

    // --- SHOPPING MODE ---
    if (orderState === OrderState.IDLE) {
       return (
        <button onClick={handleAddToBag} className="btn-shimmer flex-1 bg-nexus-gold text-black font-oswald font-bold text-xl uppercase py-4 tracking-widest hover:bg-white transition-colors rounded-full">
          Add to Bag
        </button>
       );
    }

    // --- ORDER MANAGEMENT MODE ---
    
    // 1. BUYER FLOW
    if (!auth.user?.isVendor) {
      if (orderState === OrderState.ESCROW_LOCKED) {
        return (
          <button 
            onClick={handleInitiateRelease}
            className="btn-shimmer flex-1 bg-nexus-gold text-black font-oswald font-bold text-xl uppercase py-4 tracking-widest hover:bg-white transition-colors rounded-full flex flex-col items-center leading-none gap-1"
          >
            <span>Initiate Release</span>
            <span className="text-[10px] font-mono opacity-70">STEP 1/2: PARTIAL SIGNATURE</span>
          </button>
        );
      }
      if (orderState === OrderState.SIGNING_INITIATED) {
        return (
          <div className="flex-1 bg-yellow-900/20 border border-yellow-600/50 text-yellow-500 font-mono text-center flex flex-col justify-center items-center py-3 rounded-full animate-pulse relative overflow-hidden">
             <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span className="text-lg font-bold">AWAITING VENDOR</span>
             </div>
             <span className="text-[10px] uppercase tracking-widest opacity-80">Partial Signature Secured</span>
          </div>
        );
      }
    }

    // 2. VENDOR FLOW
    if (auth.user?.isVendor) {
      if (orderState === OrderState.ESCROW_LOCKED) {
        return (
           <div className="flex-1 bg-gray-800/50 border border-gray-600 text-gray-400 font-mono text-center flex flex-col justify-center items-center py-3 rounded-full">
             <span className="text-xs uppercase">Funds Locked</span>
             <span className="text-sm font-bold">WAITING FOR BUYER INITIATION</span>
           </div>
        );
      }
      if (orderState === OrderState.SIGNING_INITIATED) {
        return (
          <button 
            onClick={handleFinalizeSignature}
            className="btn-shimmer flex-1 bg-red-600 text-white border border-red-500 font-oswald font-bold text-xl uppercase py-4 tracking-widest hover:bg-red-500 transition-colors rounded-full flex flex-col items-center leading-none gap-1 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse"
          >
            <span>Countersign & Broadcast</span>
            <span className="text-[10px] font-mono opacity-80">STEP 2/2: FINALIZE CLSAG</span>
          </button>
        );
      }
    }

    // Default Fallbacks
    if (orderState === OrderState.PENDING) {
       return (
        <div className="flex-1 bg-yellow-900/50 border border-yellow-600 text-yellow-500 font-mono text-center flex flex-col justify-center items-center py-2 animate-pulse rounded-full">
          <span className="text-xs uppercase">Generating Deposit Address...</span>
          <span className="text-lg font-bold">WAITING FOR NETWORK</span>
        </div>
       );
    }

    if (orderState === OrderState.FINALIZED) {
      return (
         <div className="flex-1 bg-green-900/30 border border-green-500 text-green-500 font-mono text-center flex flex-col justify-center items-center py-2 rounded-full">
           <span className="text-xs uppercase">Transaction Completed</span>
           <span className="text-lg font-bold">FUNDS RELEASED</span>
         </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div ref={overlayRef} className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-md opacity-0 cursor-pointer" onClick={handleClose}></div>
      
      <div ref={contentRef} className="relative w-full max-w-5xl bg-[#1a1b1c] border border-nexus-grid text-nexus-text flex flex-col md:flex-row max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] opacity-0 overflow-hidden rounded-3xl">
        
        {/* WASM SIGNING OVERLAY */}
        {isSigning && <SigningOverlay role={signingRole} />}

        {/* Left: Image */}
        <div className="w-full md:w-5/12 relative h-64 md:h-auto bg-black overflow-hidden group">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b1c] via-transparent to-transparent md:bg-gradient-to-r"></div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="p-8 pb-4 border-b border-nexus-grid/20 flex justify-between items-start">
             <div>
                <h2 className="text-3xl md:text-4xl font-oswald uppercase tracking-tight text-white">{item.title}</h2>
             </div>
             <button onClick={handleClose} className="text-gray-500 hover:text-nexus-gold p-2">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/20 p-4 border border-nexus-grid/30 rounded-xl">
                  <span className="block text-[10px] uppercase tracking-widest text-nexus-gold/70 mb-1">Price</span>
                  <span className="font-mono text-2xl text-white tracking-tighter">{item.price}</span>
                </div>
                <div className="bg-black/20 p-4 border border-nexus-grid/30 rounded-xl">
                  <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</span>
                  <span className={`font-mono text-lg ${orderState === OrderState.ESCROW_LOCKED ? 'text-green-500' : (orderState === OrderState.SIGNING_INITIATED ? 'text-yellow-500' : 'text-white')}`}>
                    {orderState.replace('_', ' ')}
                  </span>
                </div>
             </div>
             
             <div className="space-y-3">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-gray-800 pb-2">Manifest</h3>
               <p className="text-sm leading-relaxed text-gray-300 font-light font-sans">
                 This asset requires 2-of-3 multisig verification via Round-Robin CLSAG.
                 {orderState === OrderState.ESCROW_LOCKED && (
                   <span className="block mt-2 text-green-400 border border-green-900/50 bg-green-900/10 p-2 rounded-lg font-mono text-xs">
                     > ESCROW ACTIVE. FUNDS LOCKED.
                   </span>
                 )}
                 {orderState === OrderState.SIGNING_INITIATED && (
                   <span className="block mt-2 text-yellow-400 border border-yellow-900/50 bg-yellow-900/10 p-2 rounded-lg font-mono text-xs">
                     > PARTIAL SIGNATURE GENERATED. WAITING FOR COMPLETION.
                   </span>
                 )}
               </p>
             </div>
          </div>

          <div className="p-6 border-t border-nexus-grid/20 bg-black/20 backdrop-blur-sm">
             <div className="flex gap-4">
               {renderActionButton()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsModal;
