import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, TrendingUp, BookOpen, Music, Camera, Smile, Coffee, Moon, Frown, Battery } from 'lucide-react';
import RibbonBow from './RibbonBow';

// Mood configs
const MOOD_META = {
  Happy: { icon: Smile, color: '#FF69B4', bg: 'bg-[#FF69B4]', lightBg: 'bg-[#FFE5EC]', text: 'text-[#FF69B4]' },
  Cozy: { icon: Coffee, color: '#FFB6D9', bg: 'bg-[#FFB6D9]', lightBg: 'bg-[#FFF9F5]', text: 'text-[#FFB6D9]' },
  Dreamy: { icon: Moon, color: '#C084FC', bg: 'bg-[#C084FC]', lightBg: 'bg-[#F3E8FF]', text: 'text-[#C084FC]' },
  Soft: { icon: Heart, color: '#FFD6E8', bg: 'bg-[#FFD6E8]', lightBg: 'bg-[#FFF5F7]', text: 'text-[#FFD6E8]' },
  Sad: { icon: Frown, color: '#60A5FA', bg: 'bg-[#60A5FA]', lightBg: 'bg-[#EFF6FF]', text: 'text-[#60A5FA]' },
  Tired: { icon: Battery, color: '#94A3B8', bg: 'bg-[#94A3B8]', lightBg: 'bg-[#F8FAFC]', text: 'text-[#94A3B8]' }
};

export default function AnalyticsPage({ entries, setTab, isPlayingMusic, setIsPlayingMusic, userProfile }) {
  const triggerHearts = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent('spawn-cute-heart', {
      detail: { 
        count: 5, 
        x: (rect.left + rect.width / 2) / window.innerWidth * 100, 
        y: (rect.top + rect.height / 2) / window.innerHeight * 100,
        isBurst: true 
      }
    }));
  };
  const totalEntries = entries.length;
  
  const totalWords = entries.reduce((acc, entry) => {
    return acc + (entry.content ? entry.content.split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const totalPhotos = entries.filter(e => e.photo).length;
  const totalTracks = entries.filter(e => e.musicTrack).length;

  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const positiveVibesCount = entries.filter(e => 
    ['Happy', 'Cozy', 'Dreamy', 'Soft'].includes(e.mood)
  ).length;
  
  const happinessScore = totalEntries > 0 
    ? Math.round((positiveVibesCount / totalEntries) * 100) 
    : 0;

  // Top Mood
  let favoriteMood = "Cozy";
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteMood = mood;
    }
  });

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (happinessScore / 100) * circumference;

  const currentDate = new Date();
  let activeMonth = currentDate.getMonth(); // 0-indexed
  let activeYear = currentDate.getFullYear();

  // Dynamically select the month of the most recent entry if any exist
  if (entries.length > 0) {
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostRecentDate = new Date(sortedEntries[0].date);
    if (!isNaN(mostRecentDate)) {
      activeMonth = mostRecentDate.getMonth();
      activeYear = mostRecentDate.getFullYear();
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const activeMonthName = monthNames[activeMonth];

  // Get number of days in active month
  const numDays = new Date(activeYear, activeMonth + 1, 0).getDate();

  // Generate heatmap days for the active month
  const heatmapDays = Array.from({ length: numDays }, (_, i) => {
    const dNum = i + 1;
    const yearStr = activeYear.toString();
    const monthStr = (activeMonth + 1).toString().padStart(2, '0');
    const dayStr = dNum.toString().padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    const entry = entries.find(e => e.date === dateStr);
    return {
      dayNum: dNum,
      dateStr,
      mood: entry ? entry.mood : null
    };
  });

  return (
    <div className="flex-1 flex flex-col gap-6 pb-8 select-none">
      
      {/* Top Banner section: Happiness ring and heatmap side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        
        {/* Happiness score gauge Card (2/5 width on desktop) */}
        <motion.div 
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={triggerHearts}
          className="lg:col-span-2 glass-card rounded-3xl p-5 bg-gradient-to-tr from-[#FFF9F5] via-[#FFF9F5] to-[#FFE5EC] flex items-center justify-around gap-4 relative overflow-hidden cursor-pointer"
        >
          {/* Circular progress loop */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-white rounded-full shadow-inner border border-[#FFD6E8]/20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-[#FFD6E8] fill-none"
                strokeWidth="7"
              />
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-[#FF69B4] fill-none"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-[#FF69B4] font-cute">{happinessScore}%</span>
              <span className="text-[7.5px] text-[#6D4C57]/60 font-bold uppercase tracking-wider">Happiness</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-[#6D4C57] flex items-center gap-1">
              <span>Cozy Quotient</span>
              <Sparkles size={11} className="text-yellow-400" />
            </h3>
            <p className="text-[11px] text-[#6D4C57]/80 leading-relaxed font-sans pr-1">
              {totalEntries === 0 ? (
                `No whispers written yet, ${userProfile?.username || 'Esha'}! Start recording daily reflections in your diary to calculate your cozy quotient. 🌸`
              ) : happinessScore >= 75 ? (
                `Your overall mood is highly positive, ${userProfile?.username || 'Esha'}! Keep recording daily whispers to sustain this cozy, comforting glow. 🎀`
              ) : happinessScore >= 45 ? (
                `Your mood is warm and balanced, ${userProfile?.username || 'Esha'}. Every day is a fresh page to write your beautiful story. 🍰`
              ) : (
                `You've had some gentle, quiet moments, ${userProfile?.username || 'Esha'}. Be soft with yourself, you are doing your absolute best. 🧸`
              )}
            </p>
          </div>
        </motion.div>

        {/* Contributions Heatmap Card (3/5 width on desktop) */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[9px] font-black text-[#6D4C57]/45 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp size={12} className="text-[#FF69B4]" />
              <span>Emotional Heatmap</span>
            </h3>
            <span className="text-[9px] text-[#FF69B4] font-bold">Month of {activeMonthName}</span>
          </div>

          <div className="grid grid-cols-7 gap-2.5 py-1 justify-items-center">
            {heatmapDays.map((day) => {
              const hasMood = !!day.mood;
              const conf = hasMood ? MOOD_META[day.mood] : null;
              
              return (
                <motion.div
                  key={day.dayNum}
                  whileHover={{ scale: 1.25, zIndex: 10 }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all cursor-pointer ${
                    hasMood 
                      ? `${conf.bg} text-white border-transparent shadow-xs` 
                      : 'bg-[#FFF9F5]/80 border-[#FFB6D9]/30 text-[#6D4C57]/40'
                  }`}
                  title={hasMood ? `${activeMonthName} ${day.dayNum}: ${day.mood}` : `${activeMonthName} ${day.dayNum}: Empty`}
                >
                  {day.dayNum}
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[8.5px] font-bold text-[#6D4C57]/45 mt-1 px-1">
            <span>{activeMonthName} 1st</span>
            <span>{activeMonthName} {numDays}th</span>
          </div>

          {/* Mood Color Legend */}
          <div className="flex flex-wrap gap-2.5 justify-center items-center mt-3 pt-3 border-t border-[#FFB6D9]/15 text-[8.5px] font-bold text-[#6D4C57]/65">
            {Object.entries(MOOD_META).map(([name, conf]) => (
              <div key={name} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${conf.bg} border border-[#FFD6E8]/10`} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Grid of Mood Meters (all in 1 row on desktop) */}
      <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
        <span className="text-[9px] font-black text-[#6D4C57]/45 uppercase tracking-widest">Emotion Metrics</span>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(MOOD_META).map(([name, conf]) => {
            const count = moodCounts[name] || 0;
            const pct = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
            
            return (
              <motion.div
                key={name}
                whileHover={{ y: -2 }}
                className="bg-white/20 border border-white/30 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div style={{ color: conf.color }} className="mb-2">
                  <conf.icon size={20} className="stroke-[2.5px]" />
                </div>
                
                <div className="w-full bg-[#FFD6E8]/40 h-1.5 rounded-full overflow-hidden mt-1.5 mb-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${conf.bg}`}
                  />
                </div>

                <div className="flex justify-between items-center w-full px-0.5 text-[9px] font-bold text-[#6D4C57]/70">
                  <span>{name}</span>
                  <span className={conf.text}>{pct}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Aesthetic stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Words Written', value: `${totalWords} words 🎀`, icon: BookOpen, color: '#FF69B4', bg: 'bg-[#FFE5EC]', action: () => setTab('write') },
          { label: 'Primary Vibe', value: `${favoriteMood}`, icon: MOOD_META[favoriteMood]?.icon || Heart, color: MOOD_META[favoriteMood]?.color || '#C084FC', bg: MOOD_META[favoriteMood]?.lightBg || 'bg-purple-50', action: () => setTab('calendar') },
          { label: 'Music Played', value: isPlayingMusic ? 'Lofi Active 🎵' : 'Lofi Off 📻', icon: Music, color: '#F97316', bg: 'bg-orange-50', action: () => setIsPlayingMusic(!isPlayingMusic) }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                triggerHearts(e);
                if (stat.action) stat.action();
              }}
              className="glass-card rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer border border-[#FFB6D9]/15"
            >
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`} style={{ color: stat.color }}>
                <Icon size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#6D4C57]/50 font-bold block leading-none mb-0.5">{stat.label}</span>
                <span className="text-xs font-black text-[#6D4C57]/80">{stat.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Aesthetic Archive: displays all notes written till date */}
      <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#FFB6D9]/15">
          <div className="flex items-center gap-2">
            <span className="text-base">📜</span>
            <div>
              <h3 className="text-sm font-black text-[#6D4C57]">Aesthetic Archive</h3>
              <p className="text-[9px] text-[#6D4C57]/50 font-semibold uppercase tracking-wider">A collection of your quiet whispers and thoughts</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#FFE5EC] text-[#FF69B4] px-2.5 py-0.5 rounded-full font-bold border border-[#FFD6E8]/40 shadow-xs">
            {totalEntries} {totalEntries === 1 ? 'Whisper' : 'Whispers'}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
            <span className="text-3xl mb-2">🧸</span>
            <p className="text-xs text-[#6D4C57]/80 font-bold">No whispers written yet.</p>
            <button 
              onClick={() => setTab('write')}
              className="text-[10px] text-[#FF69B4] font-black underline mt-1 cursor-pointer"
            >
              Start writing your first reflection!
            </button>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-[#FFB6D9]/30">
            {entries.map((entry) => {
              const moodConfig = MOOD_META[entry.mood] || { icon: Sparkles, bg: 'bg-[#FFE5EC]', text: 'text-[#FF69B4]', color: '#FF69B4' };
              const MoodIcon = moodConfig.icon;
              
              // Formatting entry date nicely
              let displayDate = entry.date;
              try {
                const parsedDate = new Date(entry.date);
                if (!isNaN(parsedDate)) {
                  displayDate = parsedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                }
              } catch (e) {}

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FFFBF7] rounded-2xl border border-[#FFB6D9]/30 p-4 relative shadow-xs flex flex-col gap-2.5 notebook-lines overflow-hidden"
                >
                  {/* Decorative Washi Tape on the top-center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-12 h-3.5 bg-[#FF69B4]/18 border-l border-r border-[#FF69B4]/10 rotate-[-2deg] opacity-70" />

                  {/* Header: Date and Mood Badge */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-[#6D4C57]/50 font-black tracking-wider flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{displayDate}</span>
                    </span>
                    
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${moodConfig.lightBg} ${moodConfig.text} border border-[#FFB6D9]/10`}>
                      <MoodIcon size={10} className="stroke-[2.5px]" />
                      <span>{entry.mood}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-black text-[#6D4C57] leading-snug">
                    {entry.title || 'Untitled Whisper'}
                  </h4>

                  {/* Content */}
                  <p className="text-[11px] text-[#6D4C57]/80 leading-relaxed font-sans whitespace-pre-wrap pl-1 border-l border-[#FFB6D9]/15">
                    {entry.content}
                  </p>

                  {/* Footer: Stickers and Music track if any */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mt-1 pt-1.5 border-t border-[#FFB6D9]/10 text-[9px] font-bold text-[#6D4C57]/50">
                    <div className="flex items-center gap-1">
                      {entry.stickers && entry.stickers.map((sticker, idx) => (
                        <span 
                          key={idx} 
                          className="bg-white border border-[#FFD6E8] rounded-md px-1.5 py-0.5 text-[8px] tracking-wide text-[#FF69B4]"
                        >
                          {sticker === 'strawberry' && '🍓'}
                          {sticker === 'bow' && '🎀'}
                          {sticker === 'star' && '⭐'}
                          {sticker === 'moon' && '🌙'}
                          {sticker !== 'strawberry' && sticker !== 'bow' && sticker !== 'star' && sticker !== 'moon' && sticker}
                        </span>
                      ))}
                    </div>

                    {entry.musicTrack && (
                      <span className="flex items-center gap-1 text-[#FF69B4] bg-[#FFE5EC]/30 px-2 py-0.5 rounded-md border border-[#FFD6E8]/20">
                        <span>📻</span>
                        <span>{entry.musicTrack}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
