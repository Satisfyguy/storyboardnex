


import React, { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { BagItem } from '../types';

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BagItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const BagDrawer: React.FC<BagDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity,
  onCheckout
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Parse price helper
  const getPrice = (priceStr: string) => parseFloat(priceStr.split(' ')[0]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (getPrice(item.price) * item.quantity), 0);
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: 'auto' });
      gsap.to(drawerRef.current, { x: '0%', duration: 0.5, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: 'none', delay: 0.1 });
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/80 z-[80] opacity-0 pointer-events-none backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#1a1b1c] border-l border-nexus-grid z-[90] transform translate-x-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-nexus-grid/30 flex justify-between items-center bg-black/20">
          <h2 className="text-2xl font-oswald uppercase tracking-tight text-white flex items-center gap-3">
            Secure Bag
            <span className="text-sm font-mono text-nexus-gold border border-nexus-gold/30 px-2 py-1 rounded-full bg-nexus-gold/10">
              {items.length} ITEMS
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-nexus-gold transition-colors p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="font-mono uppercase tracking-widest text-sm">Bag is Empty</span>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-black/20 p-4 rounded-xl border border-nexus-grid/30 group hover:border-nexus-gold/30 transition-colors">
                {/* Image */}
                <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-oswald text-sm text-white uppercase tracking-wide line-clamp-1 pr-2">{item.title}</h3>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-nexus-gold/80 mt-1">{item.price}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-black/40 rounded-full px-2 py-1 border border-nexus-grid/30">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    <div className="font-mono text-xs text-white">
                      {(getPrice(item.price) * item.quantity).toFixed(2)} XMR
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-nexus-grid/30 bg-[#1a1b1c]">
            <div className="flex justify-between items-end mb-6 font-mono">
              <span className="text-gray-500 uppercase text-xs tracking-widest">Total Value</span>
              <div className="text-right">
                <div className="text-2xl text-nexus-gold font-bold">{total.toFixed(4)} XMR</div>
                <div className="text-[10px] text-gray-600">Excluding Network Fees</div>
              </div>
            </div>
            
            <button 
              onClick={onCheckout}
              className="btn-shimmer w-full bg-nexus-gold text-black font-oswald font-bold text-xl uppercase py-4 tracking-widest hover:bg-white transition-colors rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Secure Checkout
            </button>
            <div className="text-center mt-4">
               <span className="text-[10px] font-mono text-gray-600 uppercase flex items-center justify-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 Escrow Contracts Ready
               </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BagDrawer;