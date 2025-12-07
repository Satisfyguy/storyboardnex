
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ListingItem, OrderState } from '../types';

interface CreateListingModalProps {
  onClose: () => void;
  onSubmit: (item: ListingItem) => void;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ onClose, onSubmit }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    stock: '',
    category: 'DATA'
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to(overlayRef.current, { opacity: 1, duration: 0.3 })
      .fromTo(contentRef.current, 
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out' }
      );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: ListingItem = {
      id: `custom-${Date.now()}`,
      title: formData.title.toUpperCase(),
      price: `${formData.price} XMR`,
      hash: Math.random().toString(36).substring(2, 10).toUpperCase(),
      // Mock image for demo
      image: `https://picsum.photos/seed/${Date.now()}/600/800`, 
      category: formData.category,
      status: OrderState.IDLE,
      // New fields defaults
      stock: parseInt(formData.stock) || 1,
      vendorRating: 0, // New seller usually starts at 0 or unrated
      isVerified: true, // Assuming creation implies auth for demo
      views: 0
    };

    const tl = gsap.timeline({ onComplete: () => onSubmit(newItem) });
    tl.to(contentRef.current, { y: -20, opacity: 0, duration: 0.3 });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        ref={overlayRef} 
        className="absolute inset-0 bg-black/90 backdrop-blur-md opacity-0"
        onClick={onClose}
      />
      
      <div 
        ref={contentRef}
        className="relative w-full max-w-lg bg-[#1a1b1c] border border-nexus-gold text-nexus-text opacity-0 shadow-2xl rounded-3xl"
      >
        <div className="p-6 border-b border-nexus-grid/30 flex justify-between items-center">
          <h2 className="text-2xl font-oswald uppercase tracking-tight text-nexus-gold">
            New Manifest Entry
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-2">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Asset Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700"
              placeholder="E.G. QUANTUM_DATA_SHARD_V4" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Price (XMR)</label>
              <input 
                required
                type="number" 
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700"
                placeholder="0.00" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Initial Stock</label>
              <input 
                required
                type="number" 
                min="1"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-full placeholder-gray-700"
                placeholder="Qty" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Category</label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-full appearance-none"
              >
                <option className="bg-[#1a1b1c] text-white" value="DATA">DATA</option>
                <option className="bg-[#1a1b1c] text-white" value="HARDWARE">HARDWARE</option>
                <option className="bg-[#1a1b1c] text-white" value="PHYSICAL">PHYSICAL</option>
                <option className="bg-[#1a1b1c] text-white" value="ACCESS">ACCESS</option>
                <option className="bg-[#1a1b1c] text-white" value="SERVICES">SERVICES</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▼</div>
            </div>
          </div>

          <div className="border border-dashed border-nexus-grid p-8 text-center cursor-pointer hover:bg-nexus-grid/10 transition-colors group rounded-xl">
            <p className="text-xs font-mono text-gray-500 group-hover:text-nexus-gold uppercase">
              [ Upload Encrypted Image Blob ]
            </p>
          </div>

          <button 
            type="submit" 
            className="btn-shimmer w-full bg-nexus-gold text-black font-bold font-oswald text-lg uppercase py-4 tracking-widest hover:bg-white transition-colors rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            Publish to Network
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListingModal;
