import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Calendar, BookOpen, Music, Mic, Smile, Coffee, Moon, Frown, Battery } from 'lucide-react';
import RibbonBow from './RibbonBow';

// Mood configuration map
const MOOD_TYPES = {
  Happy: { icon: Smile, color: '#FF69B4', bgClass: 'bg-[#FF69B4] text-white', text: '#FF69B4' },
  Cozy: { icon: Coffee, color: '#FFB6D9', bgClass: 'bg-[#FFB6D9] text-[#6D4C57]', text: '#FFB6D9' },
  Dreamy: { icon: Moon, color: '#C084FC', bgClass: 'bg-[#C084FC] text-white', text: '#C084FC' },
  Soft: { icon: Heart, color: '#FFD6E8', bgClass: 'bg-[#FFD6E8] text-[#6D4C57]', text: '#FFD6E8' },
  Sad: { icon: Frown, color: '#60A5FA', bgClass: 'bg-[#60A5FA] text-white', text: '#60A5FA' },
  Tired: { icon: Battery, color: '#94A3B8', bgClass: 'bg-[#94A3B8] text-white', text: '#94A3B8' }
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MoodCalendar({ entries }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [activeMonth, setActiveMonth] = useState(() => new Date().getMonth());
  const [activeYear, setActiveYear] = useState(() => new Date().getFullYear());
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [filterMood, setFilterMood] = useState(null);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysArray = () => {
    const days = [];
    
    // Get total days in month
    const totalDays = new Date(activeYear, activeMonth + 1, 0).getDate();
    
    // Get starting weekday index (0 = Sunday, 1 = Monday, etc.)
    const startDay = new Date(activeYear, activeMonth, 1).getDay();
    
    // Monday-first offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const paddingCount = startDay === 0 ? 6 : startDay - 1;
    
    // Add padding days
    for (let i = 0; i < paddingCount; i++) {
      days.push({ isPadding: true, id: `pad-${i}` });
    }
    
    // Add active month days
    const monthStr = (activeMonth + 1).toString().padStart(2, '0');
    for (let d = 1; d <= totalDays; d++) {
      const dateString = `${activeYear}-${monthStr}-${d.toString().padStart(2, '0')}`;
      const entryForDay = entries.find(e => e.date === dateString);
      days.push({
        isPadding: false,
        dayNum: d,
        dateStr: dateString,
        entry: entryForDay
      });
    }
    return days;
  };

  const daysData = getDaysArray();

  const handlePrevMonth = () => {
    setActiveMonth((m) => {
      if (m === 0) {
        setActiveYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
    setSelectedDayInfo(null);
  };

  const handleNextMonth = () => {
    setActiveMonth((m) => {
      if (m === 11) {
        setActiveYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
    setSelectedDayInfo(null);
  };

  const handleDayClick = (day, e) => {
    if (day.isPadding) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent('spawn-cute-heart', {
      detail: { 
        count: 4, 
        x: (rect.left + rect.width / 2) / window.innerWidth * 100, 
        y: (rect.top + rect.height / 2) / window.innerHeight * 100 
      }
    }));

    if (day.entry) {
      setSelectedDayInfo(day);
    } else {
      setSelectedDayInfo({
        ...day,
        noEntry: true
      });
    }
  };

  const toggleFilter = (moodName) => {
    if (filterMood === moodName) {
      setFilterMood(null);
    } else {
      setFilterMood(moodName);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 pb-6 select-none">
      
      {/* Calendar Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1 pb-2">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-black text-[#6D4C57] font-cute keep-toy-font">
            Mood Calendar 📅
          </h2>
          
          <div className="flex items-center gap-1.5 bg-white/30 px-3 py-1 rounded-full border border-white/50">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-[#FFD6E8]/40 text-[#FF69B4] transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </motion.button>
            <span className="text-xs font-black text-[#6D4C57] min-w-[90px] text-center font-cute">
              {monthNames[activeMonth]} {activeYear}
            </span>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-[#FFD6E8]/40 text-[#FF69B4] transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Left (Heart Grid), Right (Date details & Legend) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-1">
        
        {/* Left Side: Month Grid Card */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 flex flex-col min-h-[440px]">
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center mb-6">
            {WEEKDAYS.map(day => (
              <span key={day} className="text-[9px] font-black text-[#FF69B4]/65 uppercase tracking-widest">
                {day}
              </span>
            ))}
          </div>

          {/* Heart grid cells */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="grid grid-cols-7 gap-y-4 gap-x-2.5 justify-items-center items-center py-2 flex-1 content-start"
          >
            {daysData.map((day) => {
              if (day.isPadding) {
                return <div key={day.id} className="w-10 h-10 opacity-0" />;
              }

              const hasEntry = !!day.entry;
              const mood = hasEntry ? MOOD_TYPES[day.entry.mood] : null;
              
              const matchesFilter = filterMood ? (hasEntry && day.entry.mood === filterMood) : true;
              const needsPulse = filterMood && hasEntry && day.entry.mood === filterMood;
              const isFaded = filterMood && (!hasEntry || day.entry.mood !== filterMood);
              const isSelected = selectedDayInfo && selectedDayInfo.dayNum === day.dayNum;

              return (
                <motion.button
                  key={day.dayNum}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDayClick(day, e)}
                  className={`relative w-11 h-11 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    isFaded ? 'opacity-30' : 'opacity-100'
                  } ${
                    isSelected ? 'filter drop-shadow-[0_0_8px_rgba(255,105,180,0.5)] scale-105' : ''
                  }`}
                >
                  {/* Heart Shape */}
                  <div 
                    className={`absolute inset-0 w-full h-full transition-colors duration-300 ${
                      needsPulse ? 'animate-pulse-heart' : ''
                    }`}
                    style={{
                      color: mood ? mood.color : isSelected ? '#FFD6E8' : 'rgba(255,182,217,0.15)'
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="currentColor"
                        stroke={hasEntry ? 'transparent' : '#FFB6D9'}
                        strokeWidth={hasEntry ? 0 : 2}
                        strokeDasharray={hasEntry ? 'none' : '3 3'}
                      />
                    </svg>
                  </div>

                  <span className={`relative text-xs font-black font-cute ${
                    hasEntry ? 'text-white' : 'text-[#6D4C57]'
                  }`}>
                    {day.dayNum}
                  </span>

                  {hasEntry && (
                    <span className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-xs border border-[#FFD6E8] flex items-center justify-center" style={{ color: mood.color }}>
                      <mood.icon size={8} className="stroke-[2.5px]" />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

        </div>

        {/* Right Side: Sidebar details & legend filter */}
        <div className="flex flex-col gap-6">
          
          {/* Details inspection panel */}
          <div className="glass-card rounded-3xl p-5 min-h-[220px] flex flex-col justify-between relative overflow-hidden border border-[#FFB6D9]/15">
            <div className="absolute top-1 right-3 opacity-60">
              <RibbonBow size={20} />
            </div>

            {selectedDayInfo ? (
              <div className="flex flex-col gap-3 select-text flex-1">
                <div className="flex items-center justify-between border-b border-[#FFD6E8]/20 pb-2">
                  <span className="text-[9px] font-black text-[#6D4C57]/45 uppercase tracking-wide">Date Details</span>
                  <span className="text-[9px] text-[#FF69B4] font-black">{selectedDayInfo.dateStr} 📅</span>
                </div>

                {selectedDayInfo.noEntry ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center flex-1">
                    <span className="text-2xl mb-1 text-[#FF69B4]"><Sparkles size={24} /></span>
                    <p className="text-[11px] font-bold text-[#6D4C57]/60">No entries logged for this day.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ color: MOOD_TYPES[selectedDayInfo.entry.mood].color }}>
                        {(() => {
                          const IconComp = MOOD_TYPES[selectedDayInfo.entry.mood].icon;
                          return <IconComp size={16} className="stroke-[2.5px]" />;
                        })()}
                      </span>
                      <h4 className="text-xs font-black text-[#6D4C57] leading-snug">{selectedDayInfo.entry.title}</h4>
                    </div>
                    <p className="text-[11px] text-[#6D4C57]/80 font-sans leading-relaxed bg-[#FFF9F5]/40 p-3 rounded-2xl border border-[#FFD6E8]/10 flex-1">
                      {selectedDayInfo.entry.content}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 flex-1">
                <span className="text-2xl mb-1.5 animate-bounce">🌸</span>
                <p className="text-[11px] font-bold text-[#6D4C57]/60">Select a date on the calendar grid to view whispers.</p>
              </div>
            )}
          </div>

          {/* Interactive Legend card */}
          <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 border border-[#FFB6D9]/15">
            <span className="text-[9px] font-black text-[#6D4C57]/45 uppercase tracking-wide">Mood Legend</span>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(MOOD_TYPES).map(([name, conf]) => {
                const isFiltered = filterMood === name;
                return (
                  <button
                    key={name}
                    onClick={() => toggleFilter(name)}
                    className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isFiltered
                        ? 'border-[#FF69B4] bg-white text-[#FF69B4] shadow-xs scale-105'
                        : 'border-white/20 bg-white/40 text-[#6D4C57]/80 hover:bg-[#FFF5F7]'
                    }`}
                    style={{ color: conf.color }}
                  >
                    <conf.icon size={11} className="stroke-[2.5px]" />
                    <span className="text-[#6D4C57]">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
      
    </div>
  );
}
