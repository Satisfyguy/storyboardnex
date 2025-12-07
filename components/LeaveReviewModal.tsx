
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

interface LeaveReviewModalProps {
  onClose: () => void;
  onSubmit: (review: { rating: number; comment: string }) => void;
}

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ onClose, onSubmit }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

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
    if (rating === 0) return;

    const tl = gsap.timeline({ onComplete: () => onSubmit({ rating, comment }) });
    tl.to(contentRef.current, { y: -20, opacity: 0, duration: 0.3 });
  };

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(contentRef.current, { y: 20, opacity: 0, duration: 0.3 })
      .to(overlayRef.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        ref={overlayRef} 
        className="absolute inset-0 bg-black/90 backdrop-blur-md opacity-0"
        onClick={handleClose}
      />
      
      <div 
        ref={contentRef}
        className="relative w-full max-w-lg bg-[#1a1b1c] border border-nexus-gold text-nexus-text opacity-0 shadow-2xl rounded-3xl overflow-hidden"
      >
        <div className="p-6 border-b border-nexus-grid/30 flex justify-between items-center bg-black/20">
          <h2 className="text-2xl font-oswald uppercase tracking-tight text-nexus-gold">
            Submit Feedback
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white p-2">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-3 text-center">
            <label className="text-xs uppercase tracking-widest text-gray-500">Vendor Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={star <= (hoverRating || rating) ? "text-nexus-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "text-gray-700"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <div className="h-4 text-xs font-mono text-nexus-gold/80">
              {(hoverRating || rating) === 1 && "POOR"}
              {(hoverRating || rating) === 2 && "FAIR"}
              {(hoverRating || rating) === 3 && "GOOD"}
              {(hoverRating || rating) === 4 && "EXCELLENT"}
              {(hoverRating || rating) === 5 && "EXCEPTIONAL"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 pl-2">Comment (Encrypted)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-black/40 border border-nexus-grid px-4 py-3 text-white focus:border-nexus-gold outline-none font-mono rounded-2xl placeholder-gray-700 h-32 resize-none"
              placeholder="Describe your trading experience..." 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={rating === 0}
            className={`btn-shimmer w-full font-bold font-oswald text-lg uppercase py-4 tracking-widest rounded-full shadow-lg transition-all ${rating === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-nexus-gold text-black hover:bg-white'}`}
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveReviewModal;
