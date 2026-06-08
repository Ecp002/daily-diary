import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Play, Pause, Smile, Camera, Mic, Check, Trash2, HelpCircle, Coffee, Moon, Heart, Frown, Battery } from 'lucide-react';
import RibbonBow from './RibbonBow';

// Assets for simulator photo attachments
import cafeAsset from '../assets/cafe_aesthetic.png';
import bedroomAsset from '../assets/dreamy_bedroom.png';

const STICKERS = [
  { char: '🍓', label: 'strawberry' },
  { char: '🎀', label: 'bow' },
  { char: '🧸', label: 'teddy' },
  { char: '🍭', label: 'lollipop' },
  { char: '⭐️', label: 'star' },
  { char: '💖', label: 'heart' },
  { char: '🌸', label: 'flower' },
  { char: '🌙', label: 'moon' },
  { char: '🍰', label: 'cake' },
  { char: '☕', label: 'coffee' },
  { char: '☁️', label: 'cloud' },
  { char: '🎈', label: 'balloon' },
  { char: '🐱', label: 'cat' },
  { char: '🐶', label: 'dog' },
  { char: '🍒', label: 'cherry' },
  { char: '🍪', label: 'cookie' },
  { char: '🍦', label: 'ice cream' },
  { char: '🌟', label: 'sparkle' }
];



const MOODS = ['Happy', 'Cozy', 'Dreamy', 'Soft', 'Sad', 'Tired'];

const MOOD_DETAILS = {
  Happy: { icon: Smile, color: '#FF69B4' },
  Cozy: { icon: Coffee, color: '#FFB6D9' },
  Dreamy: { icon: Moon, color: '#C084FC' },
  Soft: { icon: Heart, color: '#FFD6E8' },
  Sad: { icon: Frown, color: '#60A5FA' },
  Tired: { icon: Battery, color: '#94A3B8' }
};

export default function JournalWritingPage({ onSave, isPlayingMusic, setIsPlayingMusic, activeTrack, setActiveTrack, TRACKS }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('Cozy');
  
  // Stickers state
  const [stickersPlaced, setStickersPlaced] = useState([]);
  const [activeSticker, setActiveSticker] = useState(null);



  // Voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const recordIntervalRef = useRef(null);

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Trigger hearts when typing
  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    
    // Trigger typing heart every few characters
    if (text.length > charCount && (text.length % 4 === 0)) {
      const textarea = e.target;
      const rect = textarea.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
      
      window.dispatchEvent(new CustomEvent('spawn-cute-heart', {
        detail: { count: 1, x, y, isBurst: true }
      }));
    }
    setCharCount(text.length);
  };



  // Stickers Placement
  const handleStickerTrayClick = (sticker) => {
    setActiveSticker(sticker.char);
  };

  const handleCanvasClick = (e) => {
    if (!activeSticker) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlaced = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      char: activeSticker,
      x,
      y
    };

    setStickersPlaced((prev) => [...prev, newPlaced]);
    setActiveSticker(null);
    
    window.dispatchEvent(new CustomEvent('spawn-cute-heart', {
      detail: { count: 3, x: (e.clientX/window.innerWidth)*100, y: (e.clientY/window.innerHeight)*100 }
    }));
  };

  const removeSticker = (id, e) => {
    e.stopPropagation();
    setStickersPlaced((prev) => prev.filter(s => s.id !== id));
  };

  // Voice Note Recorder Simulator
  const handleToggleRecord = () => {
    if (isRecording) {
      clearInterval(recordIntervalRef.current);
      setIsRecording(false);
      setVoiceNote({
        duration: `0:${recordTime.toString().padStart(2, '0')}`
      });
    } else {
      setRecordTime(0);
      setIsRecording(true);
      setVoiceNote(null);
      recordIntervalRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    setTimeout(() => {
      const entryObj = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        title,
        content,
        mood: selectedMood,
        stickers: stickersPlaced.map(s => s.char),
        photo: null,
        musicTrack: isPlayingMusic ? TRACKS[activeTrack].name : null,
        voiceNote: voiceNote
      };

      onSave(entryObj);
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 pb-6 select-none relative">
      
      {/* Top Header Controls bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-[#6D4C57] flex items-center gap-1.5 font-cute keep-toy-font">
            Diary Desk ✍️
          </h2>
          <span className="text-[10px] text-[#FF69B4] font-bold bg-[#FFE5EC] px-2.5 py-0.5 rounded-full border border-[#FFB6D9]/40 select-none">
            Rule Paper Active 🎀
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          disabled={!title.trim() || !content.trim() || isSaving}
          onClick={handleSave}
          className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all ${
            (!title.trim() || !content.trim())
              ? 'bg-[#FFD6E8]/40 text-[#6D4C57]/40 cursor-not-allowed'
              : 'bg-gradient-to-tr from-[#FF69B4] to-[#FFB6D9] text-white hover:shadow-[0_4px_16px_rgba(255,105,180,0.3)]'
          }`}
        >
          {isSaving ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving Memoir...</span>
            </>
          ) : (
            <>
              <Check size={14} className="stroke-[3px]" />
              <span>Save Entry</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Mood Selector Row */}
      <div className="flex items-center gap-3 py-1">
        <span className="text-[9px] font-black text-[#6D4C57]/45 uppercase tracking-wider shrink-0">today's vibe:</span>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none w-full">
          {MOODS.map(m => {
            const detail = MOOD_DETAILS[m];
            const isSelected = selectedMood === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#FF69B4] bg-white'
                    : 'border-white/20 bg-white/20 text-[#6D4C57]/70 hover:bg-white/45'
                }`}
                style={{ color: isSelected ? detail.color : undefined }}
              >
                {React.createElement(detail.icon, { size: 10, className: "stroke-[2.5px]", style: { color: detail.color } })}
                <span className="text-[#6D4C57]">{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Grid: Left (Editor), Right (Accessories Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-1">
        
        {/* Left Column: Ruled Notepad sheet */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div 
            onClick={handleCanvasClick}
            className={`glass-card rounded-3xl flex flex-col relative overflow-hidden transition-all duration-300 min-h-[460px] border border-[#FFB6D9]/15 shadow-xs ${
              activeSticker ? 'cursor-crosshair border-dashed border-[#FF69B4] scale-[1.01]' : ''
            }`}
          >
            {/* Cute top bow */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-75 z-20">
              <RibbonBow size={26} />
            </div>



            {/* Sticker instances layer */}
            {stickersPlaced.map((sticker) => (
              <motion.div
                key={sticker.id}
                drag
                dragMomentum={false}
                className="absolute z-40 select-none sticker text-2xl"
                style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
                whileDrag={{ scale: 1.25 }}
              >
                {sticker.char}
                <button 
                  onClick={(e) => removeSticker(sticker.id, e)}
                  className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-white/95 rounded-full border border-red-200 text-red-500 text-[8px] flex items-center justify-center font-sans font-bold shadow hover:bg-red-50"
                >
                  x
                </button>
              </motion.div>
            ))}

            {/* Lined paper texture */}
            <div className="notebook-lines p-6 pt-10 flex-1 flex flex-col min-h-[460px]">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Secret Whisper Title... 🎀"
                className="bg-transparent border-none outline-none font-bold text-base text-[#FF69B4] placeholder-[#FFB6D9] mb-3 w-full font-cute"
              />
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Start typing your heart out... Let the whispers flow softly ✨"
                className="flex-1 bg-transparent border-none outline-none resize-none font-journal text-[13.5px] text-[#6D4C57]/90 placeholder-[#6D4C57]/45 leading-[2.2rem] w-full focus:ring-0"
              />
            </div>
          </div>
          
          {activeSticker && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-xs text-[#FF69B4] font-bold text-center flex items-center justify-center gap-1 mt-1"
            >
              <Sparkles size={11} className="animate-spin-slow" />
              <span>Click anywhere on the ruled paper card to stamp your sticker!</span>
            </motion.div>
          )}
        </div>

        {/* Right Column: Desk Tools and Media controls */}
        <div className="flex flex-col gap-6 p-5 rounded-3xl border border-[#FFB6D9]/15 glass-card">
          
          {/* Stickers Tray */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-[#6D4C57]/60 uppercase tracking-wider">Stamp Stickers</span>
            <div className="grid grid-cols-4 min-[370px]:grid-cols-6 gap-2">
              {STICKERS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleStickerTrayClick(s)}
                  className={`text-2xl sticker p-2 rounded-xl border transition-all flex items-center justify-center ${
                    activeSticker === s.char 
                      ? 'bg-[#FFD6E8] border-[#FF69B4] scale-110 shadow-sm' 
                      : 'bg-white border-[#FFB6D9]/20 hover:bg-[#FFF9F5]'
                  }`}
                  title={`Select ${s.label}`}
                >
                  {s.char}
                </button>
              ))}
            </div>
          </div>

          {/* Attachment options cards */}
          <div className="flex flex-col gap-3 pt-3 border-t border-[#FFD6E8]/35">
            <span className="text-[10px] font-black text-[#6D4C57]/60 uppercase tracking-wider">Multimedia Options</span>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Recorder */}
              <button
                onClick={handleToggleRecord}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isRecording 
                    ? 'bg-red-100 border-red-400 text-red-500 animate-pulse'
                    : voiceNote
                    ? 'bg-[#FFD6E8] border-[#FF69B4] text-[#FF69B4]'
                    : 'bg-white border-[#FFB6D9]/20 text-[#6D4C57]/80 hover:bg-[#FFF9F5]'
                }`}
              >
                <Mic size={15} />
                <span className="text-[9px] font-bold">
                  {isRecording ? `Rec 0:${recordTime.toString().padStart(2, '0')}` : voiceNote ? 'Voice Loaded' : 'Record'}
                </span>
              </button>

              {/* Music */}
              <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isPlayingMusic 
                    ? 'bg-[#E9D5FF] border-[#C084FC] text-[#C084FC] shadow-sm'
                    : 'bg-white border-[#FFB6D9]/20 text-[#6D4C57]/80 hover:bg-[#FFF9F5]'
                }`}
              >
                <Music size={15} />
                <span className="text-[9px] font-bold">{isPlayingMusic ? 'Music Active' : 'Soundtracks'}</span>
              </button>
            </div>
          </div>

          {/* Cassette Tape recorder simulation card */}
          {voiceNote && !isRecording && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-[#FFD6E8] to-[#FFE5EC] border border-[#FFB6D9] rounded-2xl p-2.5 flex items-center justify-between shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center gap-2 z-10">
                <div className="w-8 h-5 bg-[#FF69B4] rounded border border-white flex items-center justify-around px-1 relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-2.5 h-2.5 rounded-full border border-white border-dashed bg-white/20"
                  />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-2.5 h-2.5 rounded-full border border-white border-dashed bg-white/20"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#6D4C57] block leading-none">Voice Memo 🧸</span>
                  <span className="text-[8px] text-[#6D4C57]/60 font-semibold">Length: {voiceNote.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 z-10">
                <button className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#FF69B4] shadow hover:scale-105">
                  <Play size={10} className="fill-[#FF69B4]" />
                </button>
                <button 
                  onClick={() => setVoiceNote(null)}
                  className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-red-500 shadow hover:bg-red-50"
                >
                  <Trash2 size={10} />
                </button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 font-bold text-4xl select-none">TAPE</div>
            </motion.div>
          )}

          {/* Music player arpeggios loops list */}
          {isPlayingMusic && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col gap-1.5 p-2 bg-[#E9D5FF]/35 rounded-2xl border border-[#C084FC]/25"
            >
              <span className="text-[9px] font-bold text-[#C084FC]">Dream Lofi Tracks:</span>
              <div className="flex flex-col gap-1">
                {TRACKS.map((t, idx) => (
                  <button
                    key={t.name}
                    onClick={() => setActiveTrack(idx)}
                    className={`px-3 py-1 rounded-xl text-[9.5px] font-bold transition-all text-left flex items-center justify-between ${
                      activeTrack === idx 
                        ? 'bg-[#C084FC] text-white shadow-xs' 
                        : 'bg-white text-[#C084FC] hover:bg-[#FDFBFF]'
                    }`}
                  >
                    <span>{t.name}</span>
                    {activeTrack === idx && (
                      <span className="text-[8px] animate-pulse">Playing</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </div>

      </div>
      
    </div>
  );
}
