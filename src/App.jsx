import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Compass, BarChart3, Image as ImageIcon, Sparkles, Feather, Clock, LogOut } from 'lucide-react';
import FloatingHearts from './components/FloatingHearts';
import HomeScreen from './components/HomeScreen';
import MoodCalendar from './components/MoodCalendar';
import JournalWritingPage from './components/JournalWritingPage';
import AnalyticsPage from './components/AnalyticsPage';
import LoginScreen from './components/LoginScreen';
import EditAccountModal from './components/EditAccountModal';
import Avatar from './components/Avatar';
// Import assets
import cafeAsset from './assets/cafe_aesthetic.png';
import bedroomAsset from './assets/dreamy_bedroom.png';

// Import Firebase references
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const INITIAL_ENTRIES = [
  {
    id: 'mock-1',
    date: '2026-05-26',
    title: 'Cozy Café Afternoon 🍰',
    content: 'Spent a lovely rainy afternoon at the flower café. I ordered a hot strawberry latte and a piece of strawberry shortcake. The sound of lofi music and soft rain outside was absolute heaven! I sketched in my notebook and felt completely at ease. 🌸✨',
    mood: 'Cozy', // Happy, Cozy, Dreamy, Soft, Sad, Tired
    stickers: ['strawberry', 'bow'],
    photo: cafeAsset,
    musicTrack: 'Cozy Café 🍰',
    voiceNote: null
  },
  {
    id: 'mock-2',
    date: '2026-05-27',
    title: 'Starry Thoughts & Fairy Lights 🌙',
    content: 'My bedroom was illuminated by warm fairy lights tonight. I looked out the window and saw a thin crescent moon surrounded by twinkling stars. It felt so magical and dreamy. Writing down my intentions for tomorrow. Soft sheets, quiet room, warm thoughts.',
    mood: 'Dreamy',
    stickers: ['star', 'moon', 'bow'],
    photo: bedroomAsset,
    musicTrack: 'Sparkle Melodies 🎵',
    voiceNote: { duration: '0:42' }
  }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: 'Esha',
    pfp: 'avatar:girl1',
    streak: 6
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(6);
  const [currentTime, setCurrentTime] = useState('');

  // Auto-sync login status, user profiles and entries from Firebase Auth & Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const uid = user.uid;
        try {
          let profile = null;
          try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
              profile = docSnap.data();
            }
          } catch (e) {
            console.warn("Firestore fetch profile failed, using local fallback:", e);
          }

          if (profile) {
            setUserProfile(profile);
            setStreak(profile.streak || 0);
            localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(profile));
          } else {
            // Check user-specific localStorage cache
            const cached = localStorage.getItem(`pink_whisper_profile_${uid}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              setUserProfile(parsed);
              setStreak(parsed.streak || 0);
            } else {
              // Construct profile from email
              const emailPrefix = user.email ? user.email.split('@')[0] : 'User';
              const computedUsername = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
              const fallbackProfile = {
                username: computedUsername,
                pfp: 'avatar:girl1',
                streak: 1
              };
              setUserProfile(fallbackProfile);
              setStreak(1);
              localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(fallbackProfile));
              
              // Non-blocking Firestore save attempt
              try {
                await setDoc(doc(db, "users", uid), fallbackProfile);
              } catch (fsErr) {
                console.warn("Firestore fallback profile write failed:", fsErr);
              }
            }
          }
        } catch (e) {
          console.error("General error in onAuthStateChanged profile sync:", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync entries from Firestore when logged in, or local storage as fallback
  useEffect(() => {
    let unsubscribeEntries = () => {};

    if (isLoggedIn && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const q = query(
        collection(db, "entries"),
        where("userId", "==", uid),
        orderBy("date", "desc")
      );

      unsubscribeEntries = onSnapshot(q, (snapshot) => {
        const loadedEntries = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          let photo = data.photo;
          if (photo) {
            if (photo.includes('cafe_aesthetic') || photo.includes('cafeAsset')) {
              photo = cafeAsset;
            } else if (photo.includes('dreamy_bedroom') || photo.includes('bedroomAsset')) {
              photo = bedroomAsset;
            }
          }
          loadedEntries.push({
            id: doc.id,
            ...data,
            photo
          });
        });
        setEntries(loadedEntries);
        // Cache in user-specific local storage
        localStorage.setItem(`pink_whisper_entries_${uid}`, JSON.stringify(loadedEntries));
      }, (error) => {
        console.error("Firestore entries listener error:", error);
        // Fallback to cache for this user
        const saved = localStorage.getItem(`pink_whisper_entries_${uid}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const localMapped = parsed.map(entry => {
              if (entry.photo) {
                if (entry.photo.includes('cafe_aesthetic') || entry.photo.includes('cafeAsset')) {
                  return { ...entry, photo: cafeAsset };
                }
                if (entry.photo.includes('dreamy_bedroom') || entry.photo.includes('bedroomAsset')) {
                  return { ...entry, photo: bedroomAsset };
                }
              }
              return entry;
            });
            setEntries(localMapped);
          } catch (e) {
            setEntries([]);
          }
        } else {
          setEntries([]);
        }
      });
    } else {
      // Offline fallback
      const saved = localStorage.getItem('pink_whisper_entries');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const localMapped = parsed.map(entry => {
            if (entry.photo) {
              if (entry.photo.includes('cafe_aesthetic') || entry.photo.includes('cafeAsset')) {
                return { ...entry, photo: cafeAsset };
              }
              if (entry.photo.includes('dreamy_bedroom') || entry.photo.includes('bedroomAsset')) {
                return { ...entry, photo: bedroomAsset };
              }
            }
            return entry;
          });
          setEntries(localMapped);
        } catch (e) {
          setEntries(INITIAL_ENTRIES);
        }
      } else {
        setEntries(INITIAL_ENTRIES);
      }
      
      const localStreak = localStorage.getItem('pink_whisper_streak');
      setStreak(localStreak ? parseInt(localStreak, 10) : 6);
    }

    return () => unsubscribeEntries();
  }, [isLoggedIn]);

  const handleLogin = (profile) => {
    localStorage.setItem('pink_whisper_is_logged_in', 'true');
    setIsLoggedIn(true);
    setUserProfile(profile);
    setStreak(profile.streak);
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(profile));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
    localStorage.setItem('pink_whisper_is_logged_in', 'false');
    setIsLoggedIn(false);
    setUserProfile({
      username: 'Esha',
      pfp: 'avatar:girl1',
      streak: 6
    });
    setStreak(6);
  };

  const handleProfileSave = async (newProfile) => {
    setUserProfile(newProfile);
    setStreak(newProfile.streak);
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(newProfile));
      try {
        await setDoc(doc(db, "users", uid), newProfile);
      } catch (e) {
        console.error("Error saving profile to Firestore:", e);
      }
    }
    localStorage.setItem('pink_whisper_username', newProfile.username);
    localStorage.setItem('pink_whisper_pfp', newProfile.pfp);
    localStorage.setItem('pink_whisper_streak', newProfile.streak.toString());
  };

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);

  const audioCtxRef = useRef(null);
  const notesIntervalRef = useRef(null);

  const TRACKS = [
    { name: 'Cozy Café 🍰', notes: [60, 64, 67, 71, 65, 69, 72, 76] },
    { name: 'Sparkle Melodies 🎵', notes: [67, 71, 74, 78, 69, 72, 76, 79] },
    { name: 'Lofi Rain ☕', notes: [57, 60, 64, 67, 53, 57, 60, 64] }
  ];

  const playSynthesizerNotes = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = TRACKS[activeTrack].notes;
      let noteIndex = 0;

      notesIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;
        
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        
        const midiNote = notes[noteIndex];
        const freq = Math.pow(2, (midiNote - 69) / 12) * 440;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 2.0);
        
        noteIndex = (noteIndex + 1) % notes.length;
      }, 1000);
      
    } catch (err) {
      console.warn("Audio Context init error:", err);
    }
  };

  const stopSynthesizer = () => {
    if (notesIntervalRef.current) {
      clearInterval(notesIntervalRef.current);
      notesIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlayingMusic) {
      stopSynthesizer();
      playSynthesizerNotes();
    } else {
      stopSynthesizer();
    }
    return () => stopSynthesizer();
  }, [isPlayingMusic, activeTrack]);

  // Keep local storage sync for local cached logs
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('pink_whisper_entries', JSON.stringify(entries));
    }
  }, [entries, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('pink_whisper_streak', streak.toString());
  }, [streak]);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerSparkle = (x, y) => {
    const event = new CustomEvent('spawn-cute-heart', {
      detail: { count: 4, x, y, isBurst: true }
    });
    window.dispatchEvent(event);
  };

  const handleAddEntry = async (newEntry) => {
    const entryWithId = {
      id: newEntry.id || `local-${Date.now()}`,
      ...newEntry,
      userId: auth.currentUser?.uid || 'offline',
      createdAt: new Date().toISOString()
    };

    if (isLoggedIn && auth.currentUser) {
      const uid = auth.currentUser.uid;
      
      // Update local state and cache immediately for responsiveness & fallback
      const updatedEntries = [entryWithId, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem(`pink_whisper_entries_${uid}`, JSON.stringify(updatedEntries));

      const newStreak = streak + 1;
      setStreak(newStreak);
      const updatedProfile = { ...userProfile, streak: newStreak };
      setUserProfile(updatedProfile);
      localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(updatedProfile));

      try {
        await addDoc(collection(db, "entries"), {
          ...newEntry,
          userId: uid,
          createdAt: entryWithId.createdAt
        });

        await setDoc(doc(db, "users", uid), updatedProfile);
      } catch (e) {
        console.error("Error writing entry/profile to Firestore:", e);
      }
    } else {
      setEntries((prev) => [newEntry, ...prev]);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setUserProfile(prev => ({ ...prev, streak: newStreak }));
    }
    setCurrentTab('home');
  };

  const handleDeleteEntry = async (id) => {
    if (isLoggedIn && auth.currentUser) {
      const uid = auth.currentUser.uid;
      
      // Update local state and cache immediately
      const updatedEntries = entries.filter((e) => e.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem(`pink_whisper_entries_${uid}`, JSON.stringify(updatedEntries));

      try {
        await deleteDoc(doc(db, "entries", id));
      } catch (e) {
        console.error("Error deleting entry from Firestore:", e);
      }
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const renderView = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            entries={entries}
            streak={streak}
            setTab={setCurrentTab}
            onDeleteEntry={handleDeleteEntry}
            userProfile={userProfile}
          />
        );
      case 'calendar':
        return <MoodCalendar entries={entries} />;
      case 'write':
        return (
          <JournalWritingPage
            onSave={handleAddEntry}
            isPlayingMusic={isPlayingMusic}
            setIsPlayingMusic={setIsPlayingMusic}
            activeTrack={activeTrack}
            setActiveTrack={setActiveTrack}
            TRACKS={TRACKS}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            entries={entries}
            setTab={setCurrentTab}
            isPlayingMusic={isPlayingMusic}
            setIsPlayingMusic={setIsPlayingMusic}
            userProfile={userProfile}
          />
        );
      default:
        return (
          <HomeScreen
            entries={entries}
            streak={streak}
            setTab={setCurrentTab}
            onDeleteEntry={handleDeleteEntry}
            userProfile={userProfile}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gradient-to-tr from-[#FFE5EC] via-[#FFF0F3] to-[#FFD6E8] overflow-hidden relative font-cute">
      {/* Background Grid Pattern & Sparkles */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#FFD6E8_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-45"></div>
      <FloatingHearts />

      {/* 🎀 Left Sidebar Navigation (Desktop only) */}
      <aside className="hidden md:flex w-72 h-full flex-col p-6 bg-white/15 backdrop-blur-3xl border-r border-[#FFB6D9]/15 z-20 shadow-[4px_0_32px_rgba(255,105,180,0.03)] relative shrink-0">
        
        {/* Logo and Bow */}
        <div className="flex flex-col items-center gap-1.5 mt-4 mb-8">
          <motion.h1 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black text-[#FF69B4] tracking-wide select-none drop-shadow-[0_2px_4px_rgba(255,105,180,0.15)] flex items-center gap-1 font-toy-title keep-toy-font"
          >
            Pink Whisper 🎀
          </motion.h1>
          <p className="text-[10px] text-[#6D4C57]/60 font-bold uppercase tracking-widest mt-0.5">Daily Diary & Journal</p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 flex flex-col gap-5 mt-4">
          {[
            { id: 'home', label: 'Home Dashboard', icon: Compass },
            { id: 'calendar', label: 'Mood Calendar', icon: Calendar },
            { id: 'write', label: 'Write Diary', icon: Feather },
            { id: 'analytics', label: 'Aesthetic Insights', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={(e) => { setCurrentTab(tab.id); triggerSparkle(e.clientX, e.clientY); }}
                className={`w-full py-1.5 px-3 flex items-center gap-3.5 font-bold text-xs relative transition-all duration-300 text-left cursor-pointer group`}
              >
                <Icon 
                  size={15} 
                  className={`transition-colors duration-300 ${
                    isActive 
                      ? 'text-[#FF69B4] stroke-[2.5px]' 
                      : 'text-[#6D4C57]/45 group-hover:text-[#FF69B4]'
                  }`} 
                />
                <span 
                  className={`transition-colors duration-300 ${
                    isActive 
                      ? 'text-[#FF69B4] font-black' 
                      : 'text-[#6D4C57]/60 group-hover:text-[#FF69B4]'
                  }`}
                >
                  {tab.label}
                </span>
                
                {/* Minimalist dot indicator */}
                {isActive && (
                  <motion.span 
                    layoutId="sidebarActiveDot"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#FF69B4]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Sidebar Footer */}
        <div className="mt-auto border-t border-[#FFB6D9]/30 pt-5 flex items-center justify-between">
          <div 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full border border-[#FFB6D9] p-0.5 bg-white relative">
              <Avatar pfp={userProfile.pfp} className="w-full h-full rounded-full" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"></div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-[#6D4C57] block truncate max-w-[120px]">{userProfile.username} 💗</span>
              <span className="text-[10px] text-[#FF69B4] font-semibold">{streak} Day Streak</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              triggerSparkle(e.clientX, e.clientY);
              handleLogout();
            }}
            className="p-1.5 rounded-full hover:bg-red-50 text-red-400 transition-colors cursor-pointer"
            title="Safe Exit"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 💻 Main Desktop Panel layout */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative z-10 p-4 md:p-6 lg:p-8">
        
        {/* Top Header Banner bar */}
        <header className="h-14 px-4 flex items-center justify-between bg-transparent select-none shrink-0 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#FF69B4] font-bold bg-[#FFD6E8]/40 border border-[#FFB6D9]/15 px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Clock size={12} />
              <span>{currentTime || '11:11'}</span>
            </span>
            <span className="hidden sm:inline text-xs text-[#6D4C57]/50 font-semibold select-text">
              ✨ {userProfile.username}'s Cozy Safe Space
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Music Cassette Player */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                triggerSparkle(e.clientX, e.clientY);
                setIsPlayingMusic(!isPlayingMusic);
              }}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold shadow-xs cursor-pointer transition-all duration-300 ${
                isPlayingMusic
                  ? 'bg-[#E9D5FF] border-[#C084FC] text-[#C084FC] animate-pulse-heart'
                  : 'bg-white border-[#FFB6D9]/15 text-[#6D4C57]/60 hover:bg-[#FFE5EC]/30'
              }`}
            >
              <div className={`w-4 h-2.5 bg-current rounded-xs flex items-center justify-around px-0.5 relative shrink-0`}>
                <div className={`w-1 h-1 rounded-full bg-white ${isPlayingMusic ? 'animate-spin-slow' : ''}`} />
                <div className={`w-1 h-1 rounded-full bg-white ${isPlayingMusic ? 'animate-spin-slow' : ''}`} />
              </div>
              <span className="text-[10px] sm:text-xs">
                {isPlayingMusic ? `Playing: ${TRACKS[activeTrack].name}` : 'Play Lofi 📻'}
              </span>
            </motion.div>

            {/* Streak Counter Button Header */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={(e) => {
                triggerSparkle(e.clientX, e.clientY);
                setIsEditModalOpen(true);
              }}
              className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FFF9F5] to-[#FFE5EC] border border-[#FFB6D9]/20 text-[#FF69B4] font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Edit Account"
            >
              <span>🔥 {streak} Streak</span>
              <Sparkles size={11} className="text-yellow-400" />
            </motion.div>

            {/* Mini Profile Button (Visible on mobile/header) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditModalOpen(true)}
              className="md:hidden w-8 h-8 rounded-full border border-[#FFB6D9]/30 p-0.5 bg-white shadow-xs cursor-pointer overflow-hidden shrink-0"
              title="Edit Account"
            >
              <Avatar pfp={userProfile.pfp} className="w-full h-full rounded-full" />
            </motion.button>
          </div>
        </header>

        {/* Content Render viewport */}
        <div className="flex-1 overflow-y-auto relative scrollbar-none pb-28 md:pb-4">
          <div className="max-w-5xl mx-auto min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex-1 flex flex-col"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 📱 Bottom Navigation Bar (Mobile viewport fallback only) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 rounded-2xl glass-card flex items-center justify-around px-2 z-40 select-none shadow-[0_8px_24px_rgba(255,105,180,0.15)]">
        {[
          { id: 'home', label: 'Home', icon: Compass },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'write', label: 'Write', icon: Feather, isAction: true },
          { id: 'analytics', label: 'Insights', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isAction) {
            return (
              <div key={tab.id} className="relative -top-5">
                <motion.button
                  whileHover={{ scale: 1.12, rotate: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { setCurrentTab(tab.id); triggerSparkle(e.clientX, e.clientY); }}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF69B4] to-[#FFB6D9] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(255,105,180,0.4)] border-4 border-[#FFF9F5]"
                >
                  <Icon size={24} className="stroke-[2.5px]" />
                </motion.button>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={(e) => { setCurrentTab(tab.id); triggerSparkle(e.clientX, e.clientY); }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${
                isActive ? 'text-[#FF69B4] scale-110' : 'text-[#6D4C57]/60 hover:text-[#FF69B4]'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[9px] mt-0.5 font-semibold">{tab.label}</span>
              {isActive && (
                <motion.div layoutId="activeTabDotMobile" className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF69B4]" />
              )}
            </button>
          );
        })}
      </div>
      
      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userProfile={userProfile}
        onSave={handleProfileSave}
        onLogout={handleLogout}
      />
    </div>
  );
}
