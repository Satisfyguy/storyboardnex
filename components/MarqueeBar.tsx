import React from 'react';

const MarqueeBar: React.FC = () => {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    text: `TX_HASH_${Math.random().toString(36).substring(7).toUpperCase()} // VERIFIED`,
    value: `+${(Math.random() * 50).toFixed(4)} XMR`
  }));

  return (
    <div className="w-full border-b border-nexus-grid bg-[#252627]/90 backdrop-blur-sm overflow-hidden py-2 sticky top-0 z-40">
      <div className="relative w-full flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-xs font-inter tracking-widest text-nexus-text/60">
          {[...items, ...items, ...items].map((item, idx) => (
            <span key={`${item.id}-${idx}`} className="flex items-center gap-2">
              <span className="w-1 h-1 bg-nexus-gold rounded-full"></span>
              <span className="font-mono">{item.text}</span>
              <span className="text-nexus-gold">{item.value}</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default MarqueeBar;