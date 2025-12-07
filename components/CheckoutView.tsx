
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BagItem } from '../types';

interface CheckoutViewProps {
  items: BagItem[];
  total: number;
  onComplete: () => void;
  onCancel: () => void;
}

type CheckoutStep = 'SHIPPING' | 'PAYMENT' | 'CONFIRMATION';

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, total, onComplete, onCancel }) => {
  const [step, setStep] = useState<CheckoutStep>('SHIPPING');
  
  // Shipping State
  const [shippingForm, setShippingForm] = useState({
    alias: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  });

  const [paymentStatus, setPaymentStatus] = useState({ 
    status: 'WAITING_FOR_TX', // WAITING_FOR_TX, DETECTED, CONFIRMING, CONFIRMED
    confirmations: 0,
    timeLeft: 900 // 15 minutes in seconds
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation on mount
  useEffect(() => {
    gsap.from(containerRef.current, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
  }, []);

  // Timer for payment
  useEffect(() => {
    if (step === 'PAYMENT' && paymentStatus.timeLeft > 0 && paymentStatus.status !== 'CONFIRMED') {
      const timer = setInterval(() => {
        setPaymentStatus(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, paymentStatus.timeLeft, paymentStatus.status]);

  // Simulate Payment Process
  useEffect(() => {
    if (step === 'PAYMENT') {
      const timers: NodeJS.Timeout[] = [];
      
      // 1. Detect TX
      timers.push(setTimeout(() => {
        setPaymentStatus(prev => ({ ...prev, status: 'DETECTED' }));
      }, 3000));

      // 2. Start Confirmations
      timers.push(setTimeout(() => {
        setPaymentStatus(prev => ({ ...prev, status: 'CONFIRMING', confirmations: 1 }));
      }, 6000));

      timers.push(setTimeout(() => {
        setPaymentStatus(prev => ({ ...prev, confirmations: 2 }));
      }, 9000));

      // 3. Complete
      timers.push(setTimeout(() => {
        setPaymentStatus(prev => ({ ...prev, status: 'CONFIRMED' }));
        setTimeout(() => setStep('CONFIRMATION'), 1500);
      }, 11000));

      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [step]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("888tNkZrPN6JsEgekjMnQwT4wQ8J7K9Lz1y3pQ");
    // Could add toast notification here
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isFormValid = shippingForm.alias && shippingForm.address && shippingForm.city && shippingForm.country;

  return (
    <div ref={containerRef} className="container mx-auto px-4 pt-24 pb-24 min-h-screen flex justify-center items-start">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black/40 border border-nexus-grid p-6 rounded-3xl backdrop-blur-md sticky top-24">
            <h3 className="font-oswald text-xl uppercase text-white mb-6 border-b border-nexus-grid/30 pb-4">Order Summary</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center text-sm group">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <img src={item.image} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-mono text-white truncate font-bold">{item.title}</div>
                    <div className="text-nexus-grid text-xs">Qty: {item.quantity} × {item.price}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-nexus-grid/30 mt-6 pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                 <span>Subtotal</span>
                 <span>{total.toFixed(4)} XMR</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                 <span>Network Fee</span>
                 <span>0.0004 XMR</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-nexus-grid/10">
                 <span className="font-mono text-nexus-gold uppercase text-sm tracking-widest">Total Due</span>
                 <span className="font-oswald text-3xl text-nexus-gold">{(total + 0.0004).toFixed(4)} <span className="text-sm text-gray-500">XMR</span></span>
              </div>
            </div>
          </div>
          
          {step !== 'CONFIRMATION' && (
            <button onClick={onCancel} className="w-full py-3 text-xs font-mono uppercase text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Cancel Order & Return
            </button>
          )}
        </div>

        {/* Right Column: Checkout Steps */}
        <div className="lg:col-span-2">
          
          {/* STEP 1: SHIPPING (IMPROVED FORM) */}
          {step === 'SHIPPING' && (
            <div className="bg-[#1a1b1c] border border-nexus-gold/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-gold to-transparent"></div>
               
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h2 className="text-3xl font-oswald uppercase text-white mb-2">01 // Delivery Details</h2>
                   <p className="font-mono text-xs text-nexus-gold flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     SERVER-SIDE ENCRYPTION ACTIVE (AES-256)
                   </p>
                 </div>
                 <div className="text-gray-600 font-mono text-xs">STEP 1/2</div>
               </div>
               
               <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep('PAYMENT'); }}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-3">Recipient Alias / Name</label>
                     <input 
                       type="text"
                       value={shippingForm.alias}
                       onChange={(e) => setShippingForm({...shippingForm, alias: e.target.value})}
                       className="w-full bg-black/40 border border-nexus-grid px-6 py-4 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700 transition-colors"
                       placeholder="JOHN DOE"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-3">Country / Region</label>
                     <input 
                       type="text"
                       value={shippingForm.country}
                       onChange={(e) => setShippingForm({...shippingForm, country: e.target.value})}
                       className="w-full bg-black/40 border border-nexus-grid px-6 py-4 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700 transition-colors"
                       placeholder="SELECT TERRITORY"
                     />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-3">Street Address</label>
                     <input 
                       type="text"
                       value={shippingForm.address}
                       onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
                       className="w-full bg-black/40 border border-nexus-grid px-6 py-4 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700 transition-colors"
                       placeholder="UNIT 42, INDUSTRIAL SECTOR 7G"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-3">City</label>
                     <input 
                       type="text"
                       value={shippingForm.city}
                       onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                       className="w-full bg-black/40 border border-nexus-grid px-6 py-4 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700 transition-colors"
                       placeholder="NEO TOKYO"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-3">Postal Code</label>
                     <input 
                       type="text"
                       value={shippingForm.zip}
                       onChange={(e) => setShippingForm({...shippingForm, zip: e.target.value})}
                       className="w-full bg-black/40 border border-nexus-grid px-6 py-4 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700 transition-colors"
                       placeholder="10110"
                     />
                   </div>
                 </div>
                 
                 <div className="bg-nexus-gold/5 border border-nexus-gold/20 p-4 rounded-2xl flex gap-4 items-center">
                   <div className="w-8 h-8 rounded-full bg-nexus-gold/20 flex items-center justify-center text-nexus-gold">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                   </div>
                   <p className="text-[10px] text-gray-400 font-mono leading-relaxed flex-1">
                     <span className="text-nexus-gold font-bold">SECURITY NOTICE:</span> Your shipping data is encrypted server-side immediately upon submission using unique session keys. No plaintext data is ever stored in our database.
                   </p>
                 </div>

                 <button 
                   type="submit"
                   disabled={!isFormValid}
                   className={`btn-shimmer w-full py-4 font-oswald font-bold text-lg uppercase tracking-widest rounded-full transition-all shadow-lg ${!isFormValid ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-nexus-gold text-black hover:bg-white'}`}
                 >
                   Proceed to Payment
                 </button>
               </form>
            </div>
          )}

          {/* STEP 2: PAYMENT (ENHANCED) */}
          {step === 'PAYMENT' && (
            <div className="bg-[#1a1b1c] border border-nexus-gold/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2/3 h-1 bg-gradient-to-r from-nexus-gold to-transparent"></div>
               
               <div className="flex justify-between items-start mb-8">
                 <div>
                    <h2 className="text-3xl font-oswald uppercase text-white mb-2">02 // Initiate Transfer</h2>
                    <p className="font-mono text-xs text-nexus-gold">SEND EXACT AMOUNT TO THE ESCROW ADDRESS BELOW.</p>
                 </div>
                 <div className="text-right">
                    <div className="text-gray-600 font-mono text-xs mb-1">TIME REMAINING</div>
                    <div className="font-mono text-xl text-red-400">{formatTime(paymentStatus.timeLeft)}</div>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 {/* QR Code */}
                 <div className="bg-white p-4 rounded-2xl max-w-[200px] mx-auto md:mx-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                   <div className="aspect-square bg-black pattern-grid-lg relative overflow-hidden">
                      {/* Placeholder for QR Code */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=monero:888tNkZrPN6JsEgekjMnQwT4wQ8J7K9Lz1y3pQ?amount=${total}`} 
                        alt="XMR QR" 
                        className="w-full h-full object-cover mix-blend-multiply" 
                      />
                   </div>
                   <div className="text-center mt-2">
                     <span className="font-mono text-[10px] text-black font-bold uppercase tracking-wider">Scan to Pay</span>
                   </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-2">Monero Sub-Address</label>
                      <div className="relative group">
                        <div className="bg-black/40 border border-nexus-grid p-4 rounded-2xl font-mono text-[10px] text-gray-300 break-all leading-relaxed hover:border-nexus-gold transition-colors">
                          888tNkZrPN6JsEgekjMnQwT4wQ8J7K9Lz1y3pQ...
                        </div>
                        <button 
                          onClick={handleCopyAddress}
                          className="absolute right-2 top-2 bg-nexus-gold text-black p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                          title="Copy Address"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-2">Amount to Send</label>
                      <div className="flex items-center gap-4">
                        <div className="bg-black/40 border border-nexus-grid px-6 py-3 rounded-full font-mono text-white text-lg flex-1">
                          {(total + 0.0004).toFixed(4)}
                        </div>
                        <span className="font-oswald text-xl text-nexus-gold">XMR</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                       <label className="text-[10px] uppercase tracking-widest text-gray-500 pl-2">Network Status</label>
                       <div className="bg-black/60 rounded-2xl p-4 border border-nexus-grid/50">
                          {paymentStatus.status === 'WAITING_FOR_TX' && (
                             <div className="flex items-center gap-3 text-yellow-500">
                               <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                               </span>
                               <span className="font-mono text-xs uppercase animate-pulse">Awaiting Transaction...</span>
                             </div>
                          )}
                          {paymentStatus.status === 'DETECTED' && (
                             <div className="flex items-center gap-3 text-blue-400">
                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                               <span className="font-mono text-xs uppercase">Transaction Detected (Mempool)</span>
                             </div>
                          )}
                          {(paymentStatus.status === 'CONFIRMING' || paymentStatus.status === 'CONFIRMED') && (
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-green-400 uppercase">
                                  <span className="flex items-center gap-2">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Confirming
                                  </span>
                                  <span>{paymentStatus.confirmations}/2 Blocks</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${(paymentStatus.confirmations / 2) * 100}%` }}></div>
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 'CONFIRMATION' && (
             <div className="bg-[#1a1b1c] border border-green-500/30 p-12 rounded-3xl shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
                
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>

                <h2 className="text-4xl font-oswald uppercase text-white mb-4">Order Finalized</h2>
                <div className="bg-black/40 px-6 py-2 rounded-full border border-green-900/50 mb-6">
                   <p className="font-mono text-xs text-green-400 uppercase tracking-widest">Order ID: #7729-AFF-XMR</p>
                </div>
                
                <p className="font-mono text-sm text-gray-400 mb-8 max-w-lg leading-relaxed">
                  The escrow contract has been successfully initialized. Your funds are now locked in a 2-of-3 multisig address. The vendor has been notified to begin the shipping process to <span className="text-white border-b border-gray-600">{shippingForm.city}</span>.
                </p>

                <div className="flex gap-4 w-full max-w-md">
                  <button 
                    onClick={onComplete}
                    className="btn-shimmer flex-1 py-4 bg-nexus-gold text-black font-bold font-oswald uppercase tracking-widest rounded-full hover:bg-white transition-colors shadow-lg"
                  >
                    Return to Market
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
