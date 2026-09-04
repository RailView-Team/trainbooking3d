import React, { useEffect, useRef, useState } from 'react';

const NUM_FRAMES = 12;

export default function TrainScroll() {
  const containerRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(1);

  // Preload all 12 images on mount
  useEffect(() => {
    for (let i = 1; i <= NUM_FRAMES; i++) {
      const img = new Image();
      const frameStr = i.toString().padStart(2, '0');
      img.src = `/train-frames/train_frame_${frameStr}.png`;
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateFrame = () => {
      if (!containerRef.current) return;

      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate max scrollable distance inside the container
      const maxScroll = height - windowHeight;
      const scrolled = -top;

      let progress = scrolled / maxScroll;
      // Clamp between 0 and 1
      progress = Math.max(0, Math.min(1, progress));

      // Map to frame 1 -> 12
      // e.g. progress 0 = frame 1, progress 1 = frame 12
      const frameIndex = Math.floor(progress * (NUM_FRAMES - 1)) + 1;
      
      setCurrentFrame(frameIndex);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateFrame();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial frame
    updateFrame();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const frameStr = currentFrame.toString().padStart(2, '0');

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '500vh', position: 'relative' }}
    >
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          width: '100%', 
          height: '100vh', 
          overflow: 'hidden' 
        }}
      >
        <img
          src={`/train-frames/train_frame_${frameStr}.png`}
          alt={`Train frame ${frameStr}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}
