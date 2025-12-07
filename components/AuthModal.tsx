import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { simulateArgon2Hash } from '../utils/mockBackend';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // Registration State
  const [accountType, setAccountType] = useState<'BUYER' | 'SELLER'>('BUYER');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to(modalRef.current, { opacity: 1, duration: 0.3 })
      .fromTo(containerRef.current, 
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Network Latency / Hashing
    await simulateArgon2Hash(formData.password);
    
    setLoading(false);

    // Construct User Object based on mode
    const user: User = {
      username: formData.username.toUpperCase(),
      isVendor: mode === 'REGISTER' ? accountType === 'SELLER' : (formData.username.startsWith('VEND') || formData.username === 'RETURNING_GHOST'), // Mock logic for demo
    };

    onLogin(user);
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-[60] flex items-center justify-center p-4 opacity-0 bg-black/80 backdrop-blur-sm">
      <div ref={containerRef} className="w-full max-w-md bg-[#1a1b1c] border border-nexus-gold/30 shadow-2xl relative overflow-hidden rounded-3xl">
        {/* Header Tabs */}
        <div className="flex p-4 gap-4 border-b border-nexus-grid/30 bg-black/20">
          <button 
            onClick={() => setMode('LOGIN')}
            className={`btn-shimmer flex-1 py-3 font-oswald uppercase tracking-widest transition-all rounded-full border border-transparent ${mode === 'LOGIN' ? 'bg-nexus-gold text-black border-nexus-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-gray-500 hover:text-white hover:border-nexus-grid'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('REGISTER')}
            className={`btn-shimmer flex-1 py-3 font-oswald uppercase tracking-widest transition-all rounded-full border border-transparent ${mode === 'REGISTER' ? 'bg-nexus-gold text-black border-nexus-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-gray-500 hover:text-white hover:border-nexus-grid'}`}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Common Fields */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700" 
                placeholder={mode === 'LOGIN' ? "USER_ALIAS" : "CREATE_ALIAS"} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700" 
                placeholder="••••••••" 
                required 
              />
            </div>

            {/* Register Only: Account Type Selector */}
            {mode === 'REGISTER' && (
              <div className="space-y-3 pt-2 border-t border-nexus-grid/30">
                <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Select Role</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setAccountType('BUYER')}
                    className={`flex-1 py-3 border transition-all font-mono text-xs uppercase rounded-full ${accountType === 'BUYER' ? 'bg-nexus-text/10 border-nexus-gold text-nexus-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'border-nexus-grid text-gray-500 hover:text-white'}`}
                  >
                    Buyer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAccountType('SELLER')}
                    className={`flex-1 py-3 border transition-all font-mono text-xs uppercase rounded-full ${accountType === 'SELLER' ? 'bg-nexus-text/10 border-nexus-gold text-nexus-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'border-nexus-grid text-gray-500 hover:text-white'}`}
                  >
                    Seller
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 font-mono text-center">
                  {accountType === 'SELLER' ? 'Access to listing creation tools.' : 'Standard market access.'}
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-shimmer w-full bg-transparent border border-nexus-gold text-nexus-gold font-bold uppercase py-4 hover:bg-nexus-gold hover:text-black transition-all flex justify-center items-center gap-2 mt-4 rounded-full"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <span>{mode === 'LOGIN' ? 'Enter Market' : 'Create Identity'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;