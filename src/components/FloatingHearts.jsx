import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Heart shapes: regular heart, heart with sparkle, outline-infilled heart
const HEART_PATHS = [
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
];

const COLORS = [
  '#FFB6D9', // Primary Pink
  '#FFD6E8', // Soft Pink
  '#FF69B4', // Hot Pink
  '#E9D5FF', // Lavender
  '#FFE5EC', // Light Peach
];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  // Function to add a heart
  const addHeart = (options = {}) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const size = options.size || Math.random() * 20 + 12; // size in px
    const startX = options.x !== undefined ? options.x : Math.random() * 100; // x percentage
    const startY = options.y !== undefined ? options.y : 105; // y percentage from top
    const duration = options.duration || Math.random() * 6 + 5; // seconds to float
    const swayWidth = options.sway || Math.random() * 40 + 20; // sway amplitude in px
    const color = options.color || COLORS[Math.floor(Math.random() * COLORS.length)];
    const isBurst = !!options.isBurst;

    const newHeart = {
      id,
      size,
      x: startX,
      y: startY,
      duration,
      swayWidth,
      color,
      isBurst,
      rotation: Math.random() * 60 - 30, // start angle
    };

    setHearts((prev) => [...prev.slice(-40), newHeart]); // Keep max 40 hearts in state
  };

  // Background floating effect
  useEffect(() => {
    // Generate ambient hearts periodically
    const interval = setInterval(() => {
      // 70% chance to spawn an ambient heart every tick
      if (Math.random() < 0.7) {
        addHeart();
      }
    }, 2000);

    // Listen for custom triggerable bursts (e.g. typing)
    const handleSpawnRequest = (e) => {
      const { count = 1, x, y, isBurst = true } = e.detail || {};
      for (let i = 0; i < count; i++) {
        // Spread burst hearts slightly
        const spreadX = x !== undefined ? x + (Math.random() * 16 - 8) : Math.random() * 100;
        const spreadY = y !== undefined ? y + (Math.random() * 10 - 5) : 80;
        addHeart({
          x: spreadX,
          y: spreadY,
          size: Math.random() * 14 + 10,
          duration: Math.random() * 3 + 2.5, // Bursts fly faster
          sway: Math.random() * 30 + 10,
          isBurst,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    window.addEventListener('spawn-cute-heart', handleSpawnRequest);

    return () => {
      clearInterval(interval);
      window.removeEventListener('spawn-cute-heart', handleSpawnRequest);
    };
  }, []);

  // Cleanup completed hearts from state to maintain efficiency
  const removeHeart = (id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ 
              opacity: 0, 
              scale: 0.2, 
              x: `${heart.x}%`, 
              y: `${heart.y}vh`,
              rotate: heart.rotation 
            }}
            animate={{ 
              opacity: [0, 0.8, 0.8, 0],
              scale: [0.2, 1, 1, 0.5],
              y: '-10vh',
              x: [
                `${heart.x}%`, 
                `${heart.x + (heart.swayWidth / window.innerWidth) * 100}%`,
                `${heart.x - (heart.swayWidth / window.innerWidth) * 100}%`,
                `${heart.x + (heart.swayWidth / 2 / window.innerWidth) * 100}%`
              ]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: heart.duration, 
              ease: "easeInOut" 
            }}
            onAnimationComplete={() => removeHeart(heart.id)}
            className="absolute"
            style={{
              width: heart.size,
              height: heart.size,
              color: heart.color,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full filter drop-shadow-[0_1.5px_2px_rgba(255,105,180,0.2)]"
            >
              <path d={HEART_PATHS[0]} />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
