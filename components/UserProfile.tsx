
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { User, OrderState, ListingItem } from '../types';
import CreateListingModal from './CreateListingModal';
import LeaveReviewModal from './LeaveReviewModal';
import EscrowDashboard from './EscrowDashboard';

interface UserProfileProps {
  user: User;
  userListings?: ListingItem[];
  onCreateListing?: (item: ListingItem) => void;
  onBack: () => void;
}

// Mock Order History Data
const MOCK_HISTORY = [
  { id: 'ORD-9928-AX', item: 'ASSET_0042', amount: '4.25 XMR', date: '2023-10-12', status: OrderState.FINALIZED },
  { id: 'ORD-1102-BF', item: 'ASSET_0091', amount: '12.00 XMR', date: '2023-10-28', status: OrderState.SHIPPED },
  { id: 'ORD-3321-CC', item: 'ASSET_0105', amount: '0.85 XMR', date: '2023-11-02', status: OrderState.SIGNING_INITIATED },
  { id: 'ORD-5541-XY', item: 'ASSET_0220', amount: '2.50 XMR', date: '2023-11-05', status: OrderState.ESCROW_LOCKED },
];

const UserProfile: React.FC<UserProfileProps> = ({ user, userListings = [], onCreateListing, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'ESCROW'>('IDENTITY');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.profile-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]); // Re-animate when tab changes

  const handleReviewClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    console.log("Review submitted for", selectedOrderId, review);
    setShowReviewModal(false);
  };

  return (
    <div ref={containerRef} className="container mx-auto px-4 pt-12 pb-24 relative z-20">
      {/* Header / Nav */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 border-b border-nexus-grid/50 pb-6">
        <button 
          onClick={onBack}
          className="btn-shimmer group flex items-center gap-2 text-nexus-grid hover:text-nexus-gold transition-colors font-mono text-sm uppercase bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full border border-transparent hover:border-nexus-grid/50"
        >
          <span className="text-xl">«</span>
          <span className="group-hover:translate-x-1 transition-transform">Return to Market</span>
        </button>
        
        <h2 className="text-4xl font-oswald uppercase text-white md:ml-auto">
          User Manifest <span className="text-nexus-gold">//</span> {user.username}
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-black/40 p-1 rounded-full border border-nexus-grid/50 flex gap-2">
          <button
            onClick={() => setActiveTab('IDENTITY')}
            className={`px-8 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'IDENTITY' ? 'bg-nexus-gold text-black font-bold shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Identity Matrix
          </button>
          <button
            onClick={() => setActiveTab('ESCROW')}
            className={`px-8 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'ESCROW' ? 'bg-nexus-gold text-black font-bold shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Escrow Command
          </button>
        </div>
      </div>

      {activeTab === 'IDENTITY' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Wallet */}
          <div className="space-y-8">
            <div className="profile-card bg-black/40 border border-nexus-grid p-6 backdrop-blur-md rounded-3xl">
              <h3 className="text-nexus-gold font-mono text-xs uppercase tracking-widest mb-4 border-b border-nexus-grid/30 pb-2">Identity Details</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-nexus-gold rounded-full flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  {user.username.charAt(0)}
                </div>
                <div>
                  <div className="font-oswald text-xl text-white">{user.username}</div>
                  <div className="text-xs font-mono text-gray-500">Reputation: Level 4 (Trusted)</div>
                </div>
              </div>
              <div className="space-y-2 font-mono text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Account Type:</span>
                  <span className={`font-bold ${user.isVendor ? 'text-nexus-gold' : 'text-white'}`}>
                    {user.isVendor ? 'VENDOR' : 'BUYER'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PGP Key:</span>
                  <span className="text-green-500">ACTIVE (0x4F...9A)</span>
                </div>
              </div>
            </div>

            <div className="profile-card bg-black/40 border border-nexus-gold/30 p-6 backdrop-blur-md relative overflow-hidden group rounded-3xl">
              <h3 className="text-nexus-gold font-mono text-xs uppercase tracking-widest mb-4">Encrypted Wallet</h3>
              <div className="text-3xl font-oswald text-white mb-1">42.8041 XMR</div>
              <div className="text-xs font-mono text-gray-500 mb-6">≈ $6,420.00 USD (Ref only)</div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-shimmer bg-nexus-grid/20 hover:bg-nexus-gold hover:text-black border border-nexus-grid transition-colors py-2 text-xs font-mono uppercase rounded-full">
                  Deposit
                </button>
                <button className="btn-shimmer bg-nexus-grid/20 hover:bg-nexus-gold hover:text-black border border-nexus-grid transition-colors py-2 text-xs font-mono uppercase rounded-full">
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content based on Role */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* VENDOR CONSOLE */}
            {user.isVendor && (
              <div className="profile-card bg-nexus-gold/5 border border-nexus-gold p-6 backdrop-blur-md rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-nexus-gold font-oswald text-2xl uppercase tracking-wide">Vendor Console</h3>
                     <p className="text-xs font-mono text-gray-400">Manage your active listings.</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn-shimmer bg-nexus-gold text-black px-6 py-3 font-oswald font-bold uppercase hover:bg-white transition-all flex items-center gap-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  >
                    <span>+ Create New Asset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userListings.length > 0 ? (
                    userListings.map(item => (
                      <div key={item.id} className="bg-black/40 border border-nexus-grid/50 p-3 flex gap-3 items-center rounded-xl">
                        <div className="w-12 h-12 bg-gray-800 flex-shrink-0 rounded-lg overflow-hidden">
                           <img src={item.image} alt="" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-oswald text-white text-sm truncate">{item.title}</div>
                          <div className="font-mono text-nexus-gold text-xs">{item.price}</div>
                        </div>
                        <div className="ml-auto text-[10px] text-green-500 font-mono border border-green-900 bg-green-900/10 px-2 py-1 rounded-full">
                          ACTIVE
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 border border-dashed border-nexus-grid/30 text-gray-500 font-mono text-sm rounded-xl">
                      NO ACTIVE LISTINGS DEPLOYED
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Operation History */}
            <div className="profile-card bg-black/40 border border-nexus-grid min-h-[400px] backdrop-blur-md flex flex-col rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-nexus-grid/30 flex justify-between items-center">
                 <h3 className="text-nexus-text font-oswald text-xl uppercase tracking-wide">Operation History</h3>
                 <span className="text-[10px] font-mono text-gray-500">SYNCED: JUST NOW</span>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-nexus-grid/30 text-[10px] uppercase text-gray-500 font-mono tracking-wider">
                      <th className="p-4 font-normal">Order ID</th>
                      <th className="p-4 font-normal">Asset</th>
                      <th className="p-4 font-normal">Amount</th>
                      <th className="p-4 font-normal">Date</th>
                      <th className="p-4 font-normal">State</th>
                      <th className="p-4 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm text-gray-300">
                    {MOCK_HISTORY.map((order) => (
                      <tr key={order.id} className="border-b border-nexus-grid/10 hover:bg-nexus-gold/5 transition-colors">
                        <td className="p-4 text-nexus-gold">{order.id}</td>
                        <td className="p-4">{order.item}</td>
                        <td className="p-4">{order.amount}</td>
                        <td className="p-4 text-gray-500">{order.date}</td>
                        <td className="p-4">
                          <span className={`
                            text-[10px] uppercase px-2 py-1 border rounded-full whitespace-nowrap
                            ${order.status === OrderState.FINALIZED ? 'border-green-800 text-green-500 bg-green-900/10' : ''}
                            ${order.status === OrderState.SHIPPED ? 'border-blue-800 text-blue-500 bg-blue-900/10' : ''}
                            ${order.status === OrderState.ESCROW_LOCKED ? 'border-yellow-800 text-yellow-500 bg-yellow-900/10' : ''}
                            ${order.status === OrderState.SIGNING_INITIATED ? 'border-orange-600 text-orange-500 bg-orange-900/20 animate-pulse' : ''}
                          `}>
                            {order.status === OrderState.SIGNING_INITIATED ? 'WAITING FOR SIGNATURE' : order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                           {order.status === OrderState.FINALIZED && !user.isVendor && (
                              <button 
                                onClick={() => handleReviewClick(order.id)}
                                className="text-[10px] uppercase border border-nexus-grid hover:border-nexus-gold hover:text-nexus-gold px-3 py-1 rounded-full transition-colors"
                              >
                                Leave Review
                              </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-card animate-fade-in-up">
           <EscrowDashboard username={user.username} isVendor={user.isVendor} />
        </div>
      )}
      
      {showCreateModal && onCreateListing && (
        <CreateListingModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={(item) => {
            onCreateListing(item);
            setShowCreateModal(false);
          }}
        />
      )}

      {showReviewModal && (
        <LeaveReviewModal 
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default UserProfile;