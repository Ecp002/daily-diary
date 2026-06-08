import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, RefreshCw, Type, Check } from 'lucide-react';

const PREVIEW_FONTS = [
  // Already in the index.css
  { name: 'Quicksand', category: 'Cozy Sans (Default)', family: "'Quicksand', sans-serif", loaded: true },
  { name: 'Fredoka', category: 'Cute Rounded', family: "'Fredoka', sans-serif", loaded: true },
  { name: 'Playpen Sans', category: 'School Handwriting', family: "'Playpen Sans', sans-serif", loaded: true },
  { name: 'Satisfy', category: 'Elegant Script', family: "'Satisfy', cursive", loaded: true },

  // New fonts to be loaded dynamically
  { name: 'Inter', category: 'Clean Modern', family: "'Inter', sans-serif", loaded: false },
  { name: 'Outfit', category: 'Sleek Geometric', family: "'Outfit', sans-serif", loaded: false },
  { name: 'Comfortaa', category: 'Soft Bubble', family: "'Comfortaa', sans-serif", loaded: false },
  { name: 'Caveat', category: 'Quick Pen', family: "'Caveat', cursive", loaded: false },
  { name: 'Pacifico', category: 'Retro Script', family: "'Pacifico', cursive", loaded: false },
  { name: 'Playfair Display', category: 'Luxury Serif', family: "'Playfair Display', serif", loaded: false },
  { name: 'Lora', category: 'Literary Serif', family: "'Lora', serif", loaded: false },
  { name: 'Amatic SC', category: 'Quirky Tall', family: "'Amatic SC', sans-serif", loaded: false },
  { name: 'Architects Daughter', category: 'Architect Hand', family: "'Architects Daughter', cursive", loaded: false },
  { name: 'Cherry Bomb One', category: 'Puffy Bubble', family: "'Cherry Bomb One', cursive", loaded: false },
  { name: 'Nunito', category: 'Friendly Rounded', family: "'Nunito', sans-serif", loaded: false }
];

export default function FontPreviewOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(() => {
    const saved = localStorage.getItem('pink_whisper_selected_font');
    return saved ? JSON.parse(saved) : null;
  });

  // Load preview stylesheets on mount
  useEffect(() => {
    const linkId = 'google-fonts-preview-pack';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Architects+Daughter&family=Caveat:wght@400;700&family=Cherry+Bomb+One&family=Comfortaa:wght@300..700&family=Inter:wght@300..700&family=Lora:wght@400;700&family=Nunito:wght@400;700&family=Outfit:wght@300;400;500;700&family=Pacifico&family=Playfair+Display:wght@400;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Apply the selected font override globally
  useEffect(() => {
    if (!selectedFont) {
      const styleEl = document.getElementById('temp-font-override');
      if (styleEl) styleEl.remove();
      return;
    }

    let styleEl = document.getElementById('temp-font-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'temp-font-override';
      document.head.appendChild(styleEl);
    }

    // Force override body and content text while keeping toy font on headings/logos
    styleEl.textContent = `
      body, input, textarea, button, select, p, span:not(.keep-toy-font):not(.font-cute) {
        font-family: ${selectedFont.family} !important;
      }
      .keep-toy-font, .font-cute {
        font-family: 'Cherry Bomb One', 'Fredoka', sans-serif !important;
      }
    `;
  }, [selectedFont]);

  const selectFont = (font) => {
    setSelectedFont(font);
    localStorage.setItem('pink_whisper_selected_font', JSON.stringify(font));
    // Spawns a cute heart effect at the selection
    const event = new CustomEvent('spawn-cute-heart', {
      detail: { count: 3, x: window.innerWidth / 2, y: window.innerHeight / 2, isBurst: true }
    });
    window.dispatchEvent(event);
  };

  const handleReset = () => {
    setSelectedFont(null);
    localStorage.removeItem('pink_whisper_selected_font');
  };

  return (
    <>
      {/* 🔤 Floating trigger button */}
      <div className="fixed bottom-24 right-6 md:bottom-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/70 backdrop-blur-md border border-[#FFB6D9]/50 shadow-[0_8px_24px_rgba(255,105,180,0.15)] text-[#FF69B4] font-black text-sm cursor-pointer select-none"
        >
          <Type size={16} className="animate-pulse" />
          <span>Font Tester ✨</span>
          {selectedFont && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD6E8] text-[#FF69B4] border border-[#FFB6D9]/40 font-bold">
              {selectedFont.name}
            </span>
          )}
        </motion.button>
      </div>

      {/* Font selector drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#6D4C57] z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-4 top-4 bottom-24 md:bottom-4 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl z-50 flex flex-col glass-card border border-white/60 shadow-[0_20px_50px_rgba(109,76,87,0.15)] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#FFB6D9]/30 bg-white/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-[#FFE5EC] text-[#FF69B4]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#6D4C57] text-base leading-tight">Font Explorer</h3>
                    <p className="text-[10px] text-[#6D4C57]/60 font-semibold uppercase tracking-wider">Temporary preview</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#FFE5EC] text-[#6D4C57]/60 hover:text-[#FF69B4] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <div className="px-5 py-3 bg-[#FFF9F5]/40 border-b border-[#FFB6D9]/20 text-[11px] text-[#6D4C57]/70 font-medium">
                Click any font below to temporarily change the entire diary's font family. Reset at any time.
              </div>

              {/* Font List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scrollbar-thin">
                {PREVIEW_FONTS.map((font) => {
                  const isSelected = selectedFont && selectedFont.name === font.name;
                  const isDefault = font.name === 'Quicksand' && !selectedFont;
                  const isActive = isSelected || isDefault;

                  return (
                    <button
                      key={font.name}
                      onClick={() => selectFont(font)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between relative group ${
                        isActive
                          ? 'bg-gradient-to-tr from-[#FFF0F3] to-[#FFE5EC]/80 border-[#FFB6D9] shadow-[0_4px_12px_rgba(255,105,180,0.06)]'
                          : 'bg-white/40 border-transparent hover:bg-white/70 hover:border-[#FFB6D9]/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="block text-[10px] font-bold text-[#FF69B4]/80 uppercase tracking-wide leading-none mb-1">
                          {font.category}
                        </span>
                        {/* Preview text in the actual font */}
                        <span
                          style={{ fontFamily: font.family }}
                          className="block text-lg text-[#6D4C57] font-medium truncate leading-normal"
                        >
                          {font.name}
                        </span>
                        <span
                          style={{ fontFamily: font.family }}
                          className="block text-xs text-[#6D4C57]/60 truncate mt-0.5"
                        >
                          Cozy Strawberry shortcake 🍰✨
                        </span>
                      </div>
                      
                      {isActive ? (
                        <div className="w-6 h-6 rounded-full bg-[#FF69B4] text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce-short">
                          <Check size={12} className="stroke-[3px]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[#FFB6D9]/30 group-hover:border-[#FFB6D9]/70 flex items-center justify-center shrink-0 text-transparent group-hover:text-[#FFB6D9]/70 transition-all text-xs">
                          →
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#FFB6D9]/30 bg-white/50 flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={!selectedFont}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedFont
                      ? 'bg-[#FFE5EC] text-[#FF69B4] border border-[#FFB6D9]/40 hover:bg-[#FFD6E8] cursor-pointer'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={12} />
                  <span>Reset Default Font</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="py-3 px-6 bg-gradient-to-tr from-[#FF69B4] to-[#FFB6D9] text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(255,105,180,0.2)] hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
