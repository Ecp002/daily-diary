import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Heart, Quote, ArrowRight, RotateCw, PenTool, Smile, Coffee, Moon, Frown, Battery } from 'lucide-react';
import RibbonBow from './RibbonBow';

const MOODS = [
  { icon: Smile, label: 'Happy', color: '#FF69B4', bg: 'bg-[#FFE5EC]' },
  { icon: Coffee, label: 'Cozy', color: '#FFB6D9', bg: 'bg-[#FFF9F5]' },
  { icon: Moon, label: 'Dreamy', color: '#C084FC', bg: 'bg-[#F3E8FF]' },
  { icon: Heart, label: 'Soft', color: '#E9D5FF', bg: 'bg-[#FFF5F7]' },
  { icon: Frown, label: 'Sad', color: '#60A5FA', bg: 'bg-[#EFF6FF]' },
  { icon: Battery, label: 'Tired', color: '#94A3B8', bg: 'bg-[#F8FAFC]' },
];

const QUOTES = [
  "You are magic, Esha. Never forget that. 🎀",
  "Take a deep breath. Today was a beautiful gift. 🍰",
  "May your dreams tonight be as soft as fluffy clouds. 🌙",
  "You are capable of wonderful, sparkling things. 🌸",
  "Be gentle with yourself, you are doing your absolute best. 🧸",
  "Keep shining, the world needs your unique whisper. ✨",
  "Every day is a fresh page to write your beautiful story. 📖"
];

export default function HomeScreen({ entries, streak, setTab, onDeleteEntry, userProfile }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const cycleQuote = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const event = new CustomEvent('spawn-cute-heart', {
      detail: { 
        count: 5, 
        x: (rect.left / window.innerWidth) * 100, 
        y: (rect.top / window.innerHeight) * 100, 
        isBurst: true 
      }
    });
    window.dispatchEvent(event);
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const handleMoodSelect = (mood, e) => {
    setSelectedMood(mood.label);
    const rect = e.currentTarget.getBoundingClientRect();
    const event = new CustomEvent('spawn-cute-heart', {
      detail: { 
        count: 6, 
        x: (rect.left + rect.width / 2) / window.innerWidth * 100, 
        y: (rect.top + rect.height / 2) / window.innerHeight * 100, 
        isBurst: true 
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 pb-8 select-none">
      
      {/* Minimalist Page Header */}
      <div className="pt-2 select-none">
        <h1 className="text-3xl font-black text-[#6D4C57] font-toy-title keep-toy-font tracking-tight leading-tight">
          hey {userProfile?.username || 'Esha'}. 🎀
        </h1>
        <p className="text-xs text-[#FF69B4]/70 font-semibold tracking-wide mt-1 select-text">
          your safe sanctuary for quiet whispers and cozy reflections.
        </p>
      </div>

      {/* Mood Log section (Flat & Centered) */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] text-[#6D4C57]/45 font-black uppercase tracking-widest">how are you feeling?</span>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.label;
            return (
              <motion.button
                key={mood.label}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleMoodSelect(mood, e)}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border transition-all duration-300 shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'border-[#FF69B4] bg-white shadow-[0_8px_20px_rgba(255,105,180,0.1)]'
                    : 'border-white/30 bg-white/20 hover:bg-white/60'
                }`}
                style={{ color: mood.color }}
              >
                <mood.icon size={20} className="stroke-[2.5px]" />
              </motion.button>
            );
          })}
        </div>
        {selectedMood && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-[#FF69B4] font-black uppercase tracking-wider mt-1"
          >
            Logged as {selectedMood}! Have a beautiful evening 🎀
          </motion.p>
        )}
      </div>

      {/* My Cozy Memoirs 📖 (Vertical Feed of all entries) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6D4C57]/45 font-black uppercase tracking-widest">My Cozy Memoirs 📖</span>
          <span className="text-[10px] font-bold text-[#FF69B4] bg-[#FFE5EC] px-2.5 py-0.5 rounded-full border border-[#FFB6D9]/40">{entries.length} Entries</span>
        </div>

        {entries.length === 0 ? (
          <div className="glass-card rounded-2.5xl p-8 border border-dashed border-[#FFB6D9]/30 text-center flex flex-col items-center gap-3">
            <span className="text-3xl">🧸</span>
            <p className="text-xs font-semibold text-[#6D4C57]/60">Your diary is empty. Tap "Start Writing" to share your first secret whisper!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {entries.map((entry) => {
              const matchedMood = MOODS.find(m => m.label === entry.mood) || MOODS[0];
              // Format date and time
              let displayTime = '';
              if (entry.createdAt) {
                try {
                  const dateObj = new Date(entry.createdAt);
                  displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch (e) {}
              }
              const displayDateTime = entry.date + (displayTime ? ` at ${displayTime}` : '');

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-3xl p-6 border border-[#FFB6D9]/25 shadow-xs relative flex flex-col gap-4 bg-white/40 backdrop-blur-md"
                >
                  {/* Top row with title, mood and delete button */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${matchedMood.color}15`, color: matchedMood.color }}>
                        <matchedMood.icon size={16} className="stroke-[2.5px]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#6D4C57] font-cute">{entry.title}</h3>
                        <span className="text-[9px] text-[#6D4C57]/45 font-black uppercase tracking-wider">{displayDateTime}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this memoir from your diary? 🔒")) {
                          if (typeof onDeleteEntry === 'function') {
                            onDeleteEntry(entry.id);
                          }
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-red-50 text-[#6D4C57]/45 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete memoir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>

                  {/* Lined content section */}
                  <div className="notebook-lines py-2 px-4 bg-[#FFFBF7]/65 border border-[#FFB6D9]/15 rounded-2xl">
                    <p className="font-journal text-[12.5px] text-[#6D4C57]/90 leading-[2rem] whitespace-pre-wrap select-text">
                      {entry.content}
                    </p>
                  </div>

                  {/* Bottom info section */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#FFB6D9]/10 text-[10px]">
                    <div className="flex items-center gap-2">
                      {entry.stickers && entry.stickers.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#6D4C57]/50 font-bold uppercase tracking-wider text-[8px]">Stickers:</span>
                          <div className="flex gap-1">
                            {entry.stickers.map((st, i) => (
                              <span key={i} className="text-sm select-none">{st}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {entry.musicTrack && (
                        <span className="bg-[#E9D5FF] text-[#C084FC] font-bold px-2 py-0.5 rounded-full text-[9px] border border-[#C084FC]/15">
                          🎵 {entry.musicTrack}
                        </span>
                      )}
                      {entry.voiceNote && (
                        <span className="bg-[#FFE5EC] text-[#FF69B4] font-bold px-2 py-0.5 rounded-full text-[9px] border border-[#FFB6D9]/20 flex items-center gap-1">
                          🎤 Voice Note
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row: Quick Write CTA */}
      <motion.div 
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setTab('write')}
        className="glass-card rounded-2.5xl p-5 border border-[#FFB6D9]/15 flex items-center justify-between cursor-pointer group shadow-xs hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#FF69B4] shadow-xs group-hover:rotate-12 transition-transform duration-300">
            <PenTool size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#6D4C57] group-hover:text-[#FF69B4] transition-colors">Start Writing Tonight's Chapter</h3>
            <p className="text-[10px] text-[#6D4C57]/50 font-medium">Pour your emotions into cozy paper sheets...</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-[#FF69B4] group-hover:translate-x-1.5 transition-transform duration-300" />
      </motion.div>

      {/* Bottom Grid: Quote and Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Quote Card (2/3 width) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={cycleQuote}
          className="md:col-span-2 glass-card rounded-2.5xl p-5 flex flex-col justify-center border border-[#FFB6D9]/15 cursor-pointer shadow-xs relative"
        >
          <div className="absolute top-3 left-4 opacity-15">
            <Quote size={18} className="text-[#FF69B4] fill-[#FF69B4]/10" />
          </div>
          <p className="font-script text-base text-[#FF69B4] leading-relaxed text-center select-none pt-2">
            "{QUOTES[quoteIndex].replace('Esha', userProfile?.username || 'Esha')}"
          </p>
        </motion.div>

        {/* Streak Details Box (1/3 width) */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            window.dispatchEvent(new CustomEvent('spawn-cute-heart', {
              detail: { 
                count: 5, 
                x: (rect.left + rect.width / 2) / window.innerWidth * 100, 
                y: (rect.top + rect.height / 2) / window.innerHeight * 100,
                isBurst: true
              }
            }));
            setTab('analytics');
          }}
          className="glass-card rounded-2.5xl p-5 flex items-center justify-between border border-[#FFB6D9]/15 shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFD6E8]/60 flex items-center justify-center text-[#FF69B4]">
              <Flame size={16} className="fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#6D4C57] leading-none mb-0.5">Streak</h3>
              <span className="text-[8px] text-[#FF69B4] font-bold uppercase tracking-wider">{streak} days 🎀</span>
            </div>
          </div>
          <span className="text-xl font-black text-[#FF69B4] font-cute">{streak}</span>
        </motion.div>

      </div>

    </div>
  );
}
