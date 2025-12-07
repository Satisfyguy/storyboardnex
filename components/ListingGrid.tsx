
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ListingItem, AuthState, OrderState } from '../types';
import gsap from 'gsap';
import ListingDetailsModal from './ListingDetailsModal';
import { validateSearchQuery } from '../utils/mockBackend';

interface ListingGridProps {
  velocityRef: React.MutableRefObject<number>;
  auth: AuthState;
  triggerAuth: () => void;
  customListings?: ListingItem[];
  onAddToBag: (item: ListingItem) => void;
}

// Helper to parse price string to number for sorting
const parsePrice = (priceStr: string) => parseFloat(priceStr.split(' ')[0]);

// Generate mock data helper with new Business Logic fields
const generateItems = (count: number, startIndex: number): ListingItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `item-${startIndex + i}`,
    title: `ASSET_${(startIndex + i).toString().padStart(4, '0')}`,
    price: `${(Math.random() * 20 + 0.5).toFixed(2)} XMR`,
    hash: Math.random().toString(36).substring(2, 15),
    image: `https://picsum.photos/seed/${startIndex + i}/600/800`,
    category: ['DATA', 'HARDWARE', 'PHYSICAL', 'ACCESS', 'SERVICES'][Math.floor(Math.random() * 5)],
    status: OrderState.IDLE,
    // New Sales Data
    stock: Math.floor(Math.random() * 50),
    vendorRating: 3.5 + Math.random() * 1.5, // 3.5 to 5.0
    isVerified: Math.random() > 0.3, // 70% verified
    views: Math.floor(Math.random() * 5000)
  }));
};

const ListingGrid: React.FC<ListingGridProps> = ({ velocityRef, auth, triggerAuth, customListings = [], onAddToBag }) => {
  const [allItems, setAllItems] = useState<ListingItem[]>(generateItems(8, 0));
  const [displayedItems, setDisplayedItems] = useState<ListingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('NEWEST');
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  
  const loaderRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = ['ALL', 'DATA', 'HARDWARE', 'PHYSICAL', 'ACCESS', 'SERVICES'];

  // Combine custom listings with infinite scroll items
  const combinedItems = useMemo(() => {
    return [...customListings, ...allItems];
  }, [customListings, allItems]);

  // Filter & Sort Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered = combinedItems.filter(item => {
        const matchesSearch = validateSearchQuery(searchQuery, item);
        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      // Apply Sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'PRICE_ASC':
            return parsePrice(a.price) - parsePrice(b.price);
          case 'PRICE_DESC':
            return parsePrice(b.price) - parsePrice(a.price);
          case 'RATING':
            return b.vendorRating - a.vendorRating;
          case 'NEWEST':
          default:
            // Assuming higher ID index or custom listings are newer
            return 0; 
        }
      });

      setDisplayedItems(filtered);
      
      // Re-trigger animations for new results
      if(gridRef.current) {
         const cards = gridRef.current.querySelectorAll('.listing-card');
         gsap.fromTo(cards, 
           { opacity: 0, y: 20 },
           { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, clearProps: 'all' }
         );
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery, combinedItems, selectedCategory, sortBy]);

  // Infinite Scroll Loading
  const loadMore = useCallback(() => {
    if (searchQuery || selectedCategory !== 'ALL') return; // Disable infinite scroll during search or filter
    setTimeout(() => {
      const newItems = generateItems(4, allItems.length);
      setAllItems(prev => [...prev, ...newItems]);
    }, 500);
  }, [allItems.length, searchQuery, selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  // Velocity Distortion Effect
  useEffect(() => {
    const updateDistortion = () => {
      if (!gridRef.current) return;
      const velocity = velocityRef.current;
      const cards = gridRef.current.querySelectorAll('.listing-card');
      if (cards.length === 0) return;

      const skew = Math.min(Math.max(velocity * 0.5, -10), 10);
      const stretch = 1 + Math.min(Math.abs(velocity * 0.002), 0.15);

      gsap.set(cards, {
        skewY: skew,
        scaleY: stretch,
        force3D: true
      });
    };
    gsap.ticker.add(updateDistortion);
    return () => { gsap.ticker.remove(updateDistortion); };
  }, [velocityRef, displayedItems]);

  return (
    <div className="container mx-auto px-4 relative z-10">
      
      {/* Search Bar & Filters */}
      <div className="mb-12 border-b border-nexus-grid pb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          
          {/* Search Input */}
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              placeholder="SEARCH_MANIFEST_ENTRIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-nexus-grid px-6 py-4 text-nexus-gold font-mono uppercase focus:outline-none focus:border-nexus-gold transition-colors text-lg placeholder-nexus-grid/50 rounded-full"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-nexus-grid text-xs font-mono">
              {displayedItems.length} RESULTS
            </div>
          </div>

          {/* Sort Controls (Frictionless UX) */}
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-mono text-nexus-grid uppercase tracking-widest hidden md:block">Sort By:</span>
             <select 
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-black/40 border border-nexus-grid text-nexus-text text-xs font-mono uppercase px-4 py-2 rounded-full focus:border-nexus-gold outline-none cursor-pointer appearance-none hover:bg-nexus-grid/10 transition-colors"
             >
               <option className="bg-[#252627] text-white" value="NEWEST">Newest Arrivals</option>
               <option className="bg-[#252627] text-white" value="RATING">Highest Rated</option>
               <option className="bg-[#252627] text-white" value="PRICE_ASC">Price: Low to High</option>
               <option className="bg-[#252627] text-white" value="PRICE_DESC">Price: High to Low</option>
             </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 text-[10px] md:text-xs font-mono uppercase tracking-widest rounded-full border transition-all duration-300
                ${selectedCategory === cat 
                  ? 'bg-nexus-gold text-black border-nexus-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] transform scale-105 btn-shimmer' 
                  : 'bg-black/40 text-gray-500 border-nexus-grid/30 hover:border-nexus-gold hover:text-white'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12"
      >
        {displayedItems.map((item) => (
          <div 
            key={item.id} 
            className="listing-card group relative bg-black/20 border border-nexus-grid hover:border-nexus-gold transition-colors duration-300 transform-gpu origin-center will-change-transform flex flex-col h-full"
          >
            {/* Image Section */}
            <div className="aspect-[3/4] overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500 bg-black">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              
              {/* Trust & Popularity Badges */}
              <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start z-10">
                 {item.views > 3500 && (
                   <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm animate-pulse shadow-lg">
                     Hot Item
                   </span>
                 )}
                 {item.isVerified && (
                   <div className="ml-auto bg-nexus-gold/90 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1 shadow-lg">
                     <span className="w-2 h-2 rounded-full bg-black"></span>
                     Verified
                   </div>
                 )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center backdrop-blur-[2px]">
                 <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col items-center gap-3 w-full px-8">
                    <p className="text-nexus-gold/80 font-mono text-[10px] tracking-widest border-b border-nexus-gold/30 pb-1 w-full text-center">
                      ID: {item.hash.toUpperCase()}
                    </p>
                    <button 
                      className="btn-shimmer w-full py-3 bg-nexus-gold text-nexus-bg font-oswald font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-2 rounded-full"
                      onClick={() => setSelectedItem(item)}
                    >
                      <span>View Details</span>
                    </button>
                 </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 border-t border-nexus-grid bg-[#252627] flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                 <h3 className="font-oswald text-xl text-white uppercase tracking-wider leading-none truncate pr-2" title={item.title}>{item.title}</h3>
                 <div className="flex items-center gap-1 text-nexus-gold text-xs">
                    <span>★</span>
                    <span className="font-mono">{item.vendorRating.toFixed(1)}</span>
                 </div>
              </div>
              
              <div className="text-xs font-mono text-nexus-grid/50 mb-4 flex items-center justify-center space-x-2 w-full">
                <span className="border border-nexus-grid/30 px-1">{item.category}</span>
                <span className="text-[10px]">{item.views.toLocaleString()} views</span>
              </div>

              <div className="mt-auto">
                 {/* Scarcity Trigger */}
                 <div className="mb-2">
                    <div className="flex justify-between text-[10px] uppercase font-mono mb-1">
                       <span className={item.stock < 10 ? 'text-red-500 font-bold animate-pulse' : 'text-gray-500'}>
                         {item.stock < 10 ? '⚠ Low Stock' : 'Stock Level'}
                       </span>
                       <span className="text-gray-400">{item.stock} Units</span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${item.stock < 10 ? 'bg-red-500' : 'bg-nexus-gold'}`} 
                         style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                       ></div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-3 border-t border-nexus-grid/20">
                    <span className="font-inter text-nexus-gold font-bold text-lg">{item.price}</span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-nexus-grid/50 text-gray-500 rounded-full hover:border-nexus-gold hover:text-nexus-gold transition-colors">
                       2/3 Multisig
                    </span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {!searchQuery && selectedCategory === 'ALL' && (
        <div ref={loaderRef} className="h-24 w-full flex items-center justify-center mt-12">
          <div className="flex gap-1">
            <span className="w-1 h-8 bg-nexus-gold animate-[pulse_1s_ease-in-out_infinite] rounded-full"></span>
            <span className="w-1 h-8 bg-nexus-gold animate-[pulse_1s_ease-in-out_0.2s_infinite] rounded-full"></span>
            <span className="w-1 h-8 bg-nexus-gold animate-[pulse_1s_ease-in-out_0.4s_infinite] rounded-full"></span>
          </div>
        </div>
      )}

      {selectedItem && (
        <ListingDetailsModal 
          item={selectedItem} 
          auth={auth}
          onAuthRequest={triggerAuth}
          onClose={() => setSelectedItem(null)} 
          onAddToBag={onAddToBag}
        />
      )}
    </div>
  );
};

export default ListingGrid;
