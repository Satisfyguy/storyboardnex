

import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactLenis from 'lenis/react';
import WebGLBackground from './components/WebGLBackground';
import MarqueeBar from './components/MarqueeBar';
import NetworkStatus from './components/NetworkStatus';
import ListingGrid from './components/ListingGrid';
import UserProfile from './components/UserProfile';
import AuthModal from './components/AuthModal';
import BagDrawer from './components/BagDrawer';
import CheckoutView from './components/CheckoutView';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthState, User, AppView, ListingItem, BagItem } from './types';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const velocityRef = useRef(0);
  const lenisRef = useRef<any>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Global App State
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Lifted Listings State
  const [userListings, setUserListings] = useState<ListingItem[]>([]);

  // Bag State
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);

  // Bag Helpers
  const bagCount = useMemo(() => bagItems.reduce((acc, item) => acc + item.quantity, 0), [bagItems]);
  const bagTotal = useMemo(() => {
    return bagItems.reduce((sum, item) => sum + (parseFloat(item.price.split(' ')[0]) * item.quantity), 0);
  }, [bagItems]);

  const handleAddToBag = (item: ListingItem) => {
    setBagItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsBagOpen(true);
  };

  const handleRemoveFromBag = (id: string) => {
    setBagItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateBagQuantity = (id: string, delta: number) => {
    setBagItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, Math.min(i.stock, i.quantity + delta));
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const handleCheckout = () => {
    setIsBagOpen(false);
    setCurrentView(AppView.CHECKOUT);
  };

  const handleOrderComplete = () => {
    setBagItems([]);
    setCurrentView(AppView.HOME);
  };

  // Sync Lenis with GSAP
  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    return () => { gsap.ticker.remove(update); };
  }, []);

  const onScroll = (e: any) => {
    velocityRef.current = e.velocity;
  };

  useEffect(() => {
    // Only animate Hero text if on Home view
    if (currentView === AppView.HOME) {
      const ctx = gsap.context(() => {
        // Title Animation
        gsap.from(titleRef.current, { y: 100, opacity: 0, duration: 1.5, ease: 'power4.out', delay: 0.2 });
        // Line Animation
        gsap.to('.hero-line', { scaleX: 1, duration: 1.5, ease: 'expo.inOut', delay: 0.5 });
        
        // Subtext Animation: Vertical Clip Slide Down
        gsap.fromTo('.hero-char', 
          { y: '-105%' },
          { y: '0%', duration: 1, ease: 'power3.out', stagger: 0.015, delay: 0.8 }
        );
      });
      return () => ctx.revert();
    }
  }, [currentView]);

  const handleLogin = (user: User) => {
    setAuth({ isAuthenticated: true, user });
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null });
    setCurrentView(AppView.HOME);
    setBagItems([]);
  };

  const handleCreateListing = (newItem: ListingItem) => {
    setUserListings(prev => [newItem, ...prev]);
  };

  const heroSubtext = "Monero Only // 2of3 Multisig // Non-Custodial";

  return (
    <ReactLenis ref={lenisRef} root options={{ lerp: 0.08, smoothWheel: true }} autoRaf={false} onScroll={onScroll}>
      <div className="min-h-screen relative w-full text-nexus-text selection:bg-nexus-gold selection:text-black">
        
        <WebGLBackground velocityRef={velocityRef} />

        {/* Interactive Logo */}
        <button
           onClick={() => setCurrentView(AppView.HOME)}
           className="fixed top-12 left-8 z-50 flex items-center gap-3 group cursor-pointer transition-opacity duration-300"
           aria-label="Go to Home"
        >
            {/* Logo Icon */}
            <div className="w-10 h-10 border border-nexus-gold/50 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:border-nexus-gold group-hover:bg-nexus-gold/10 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <div className="w-2 h-2 bg-nexus-gold rounded-full group-hover:scale-[1.5] group-hover:animate-pulse transition-transform duration-300"></div>
            </div>
            {/* Logo Text */}
            <div className="hidden md:flex flex-col items-start leading-none opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="font-oswald text-2xl font-bold tracking-widest text-white group-hover:text-nexus-gold transition-colors duration-300">NEXUS</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-nexus-grid group-hover:text-white transition-colors duration-300">Protocol v3</span>
            </div>
        </button>

        {/* Header / Auth Status */}
        <div className="fixed top-12 right-8 z-50 transition-all duration-300 flex items-center gap-4">
          
          {/* Bag Button */}
          {auth.isAuthenticated && (
            <button 
              onClick={() => setIsBagOpen(true)}
              className="btn-shimmer relative bg-black/40 backdrop-blur-md w-[50px] h-[50px] flex items-center justify-center border border-nexus-grid/50 hover:border-nexus-gold hover:text-nexus-gold text-gray-400 transition-all rounded-full group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-nexus-gold text-black text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
                  {bagCount}
                </span>
              )}
            </button>
          )}

          {auth.isAuthenticated ? (
            <div className="flex items-center gap-4">
               {/* User Badge - Clickable */}
               <button 
                 onClick={() => setCurrentView(AppView.PROFILE)}
                 className="btn-shimmer flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 border border-nexus-grid/50 hover:border-nexus-gold hover:bg-nexus-gold/10 transition-all group text-left rounded-full"
               >
                 <div className="hidden md:block pl-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-nexus-gold transition-colors">Identity</div>
                    <div className="font-mono text-nexus-gold text-sm leading-none">{auth.user?.username}</div>
                 </div>
                 <div className="w-8 h-8 bg-nexus-gold rounded-full flex items-center justify-center text-black font-bold group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                   {auth.user?.username.charAt(0)}
                 </div>
               </button>

               {/* Logout Button */}
               <button 
                 onClick={handleLogout}
                 className="btn-shimmer bg-black/40 backdrop-blur-md h-[50px] w-[50px] flex items-center justify-center border border-nexus-grid/50 hover:border-red-500 hover:text-red-500 text-gray-500 transition-all rounded-full"
                 title="Disconnect"
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
               </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="btn-shimmer px-6 py-2 bg-nexus-gold/10 border border-nexus-gold text-nexus-gold font-oswald uppercase tracking-widest hover:bg-nexus-gold hover:text-black transition-all rounded-full"
            >
              Connect Identity
            </button>
          )}
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <MarqueeBar />

          {/* VIEW SWITCHER LOGIC */}
          {(() => {
            switch (currentView) {
              case AppView.CHECKOUT:
                return (
                  <CheckoutView 
                    items={bagItems} 
                    total={bagTotal}
                    onComplete={handleOrderComplete}
                    onCancel={() => setCurrentView(AppView.HOME)}
                  />
                );
              case AppView.PROFILE:
                return (
                  <div className="pt-24 min-h-screen">
                    <UserProfile 
                      user={auth.user!} 
                      userListings={userListings}
                      onCreateListing={handleCreateListing}
                      onBack={() => setCurrentView(AppView.HOME)} 
                    />
                  </div>
                );
              case AppView.HOME:
              default:
                return (
                  <>
                    <header className="relative w-full h-[70vh] flex flex-col justify-center items-center px-4 overflow-hidden">
                      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-transparent to-transparent"></div>
                      <div className="relative z-10 text-center">
                        <h1 ref={titleRef} className="text-[12vw] leading-[0.85] font-oswald font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mix-blend-overlay">
                          Trade + <br/> Anonymous
                        </h1>
                        <div className="hero-line w-full h-[1px] bg-nexus-gold mt-8 transform scale-x-0 origin-center"></div>
                        
                        <div className="mt-6 font-inter text-lg uppercase tracking-[0.3em] md:tracking-[0.5em] text-nexus-grid/80 overflow-hidden" aria-label={heroSubtext}>
                          {heroSubtext.split('').map((char, index) => (
                            <span key={index} className="inline-block overflow-hidden align-top">
                              <span className="hero-char inline-block will-change-transform">
                                {char === ' ' ? '\u00A0' : char}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </header>

                    <main className="w-full relative">
                      <div className="container mx-auto px-4 mb-8 flex items-center justify-between">
                        <h2 className="font-oswald text-4xl uppercase">Market Interface</h2>
                      </div>
                      
                      <ListingGrid 
                        velocityRef={velocityRef} 
                        auth={auth} 
                        triggerAuth={() => setShowAuthModal(true)} 
                        customListings={userListings}
                        onAddToBag={handleAddToBag}
                      />
                    </main>
                  </>
                );
            }
          })()}

          <footer className="w-full border-t border-nexus-grid bg-black py-12 mt-auto relative z-20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
              <div className="font-oswald text-2xl uppercase tracking-widest text-white/50">NEXUS</div>
              <div className="font-mono text-xs text-nexus-grid mt-4 md:mt-0">
                ENCRYPTED CONNECTION ESTABLISHED via RUST_ACTIX_CORE // XMR_NODE_ACTIVE
              </div>
            </div>
          </footer>
        </div>

        <NetworkStatus />

        {/* Auth Modal Overlay */}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onLogin={handleLogin} 
          />
        )}

        {/* Bag Drawer */}
        <BagDrawer 
           isOpen={isBagOpen} 
           onClose={() => setIsBagOpen(false)}
           items={bagItems}
           onRemove={handleRemoveFromBag}
           onUpdateQuantity={handleUpdateBagQuantity}
           onCheckout={handleCheckout}
        />
      </div>
    </ReactLenis>
  );
}

export default App;