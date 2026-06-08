import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, AlertCircle } from 'lucide-react';
import Avatar from './Avatar';
import FloatingHearts from './FloatingHearts';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Generate random coordinates and attributes for floating background icons
const FLOATING_SHAPES = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  size: Math.random() * 16 + 14,
  x: Math.random() * 90 + 5,
  y: Math.random() * 85 + 5,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 7,
  type: ['sparkle', 'star', 'heart', 'bow'][i % 4]
}));

export default function LoginScreen({ onLogin }) {
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    // Register a Firebase auth state listener for auto-login
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isSubmittingRef.current) return;
        try {
          let profile = null;
          try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
              profile = docSnap.data();
            }
          } catch (e) {
            console.warn("Firestore fetch failed in LoginScreen auto-login:", e);
          }

          if (!profile) {
            const cached = localStorage.getItem(`pink_whisper_profile_${user.uid}`);
            if (cached) {
              profile = JSON.parse(cached);
            } else {
              const emailPrefix = user.email ? user.email.split('@')[0] : 'User';
              const computedUsername = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
              profile = {
                username: computedUsername,
                pfp: user.photoURL || 'avatar:cat',
                streak: parseInt(localStorage.getItem('pink_whisper_streak') || '1', 10)
              };
              localStorage.setItem(`pink_whisper_profile_${user.uid}`, JSON.stringify(profile));
            }
          }
          onLogin(profile);
        } catch (e) {
          console.error("Auto log-in error:", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    isSubmittingRef.current = true;
    try {
      const provider = new GoogleAuthProvider();
      setIsSuccess(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;

      // Extract details
      const emailPrefix = user.email ? user.email.split('@')[0] : 'Explorer';
      const computedUsername = user.displayName || (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
      
      let profile = {
        username: computedUsername,
        pfp: user.photoURL || 'avatar:cat',
        streak: 1
      };

      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          profile = docSnap.data();
        } else {
          await setDoc(docRef, profile);
        }
      } catch (fsErr) {
        console.error("Firestore Google login profile fetch failed, using fallback:", fsErr);
        const cached = localStorage.getItem(`pink_whisper_profile_${uid}`);
        if (cached) {
          profile = JSON.parse(cached);
        }
      }

      // Sync user profile to localStorage caches
      localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(profile));

      // Local storage active session fallbacks
      localStorage.setItem('pink_whisper_username', profile.username);
      localStorage.setItem('pink_whisper_pfp', profile.pfp);
      localStorage.setItem('pink_whisper_streak', profile.streak.toString());
      localStorage.setItem('pink_whisper_is_logged_in', 'true');

      const triggerHearts = () => {
        const event = new CustomEvent('spawn-cute-heart', {
          detail: { count: 30, x: window.innerWidth / 2, y: window.innerHeight / 2, isBurst: true }
        });
        window.dispatchEvent(event);
      };
      triggerHearts();

      setTimeout(() => {
        onLogin(profile);
      }, 1200);
    } catch (err) {
      isSubmittingRef.current = false;
      setIsSuccess(false);
      console.error("Google Auth error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign in failed! Please try again 🌸');
      }
    }
  };

  // Cursor trail trigger
  const handleMouseMove = (e) => {
    if (Math.random() < 0.12) {
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      window.dispatchEvent(
        new CustomEvent('spawn-cute-heart', {
          detail: { count: 1, x: xPercent, y: yPercent, isBurst: false }
        })
      );
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-tr from-[#FFE5EC] via-[#FFF0F3] to-[#FFD6E8] overflow-hidden select-none font-cute"
    >
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#FFD6E8_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-45"></div>
      <FloatingHearts />

      {/* Floating Animated Background Stickers */}
      {FLOATING_SHAPES.map((shape) => (
        <motion.div
          key={shape.id}
          initial={{ y: `${shape.y}vh`, x: `${shape.x}vw`, opacity: 0, scale: 0 }}
          animate={{
            y: [`${shape.y}vh`, `${shape.y - 10}vh`, `${shape.y}vh`],
            x: [`${shape.x}vw`, `${shape.x + 3}vw`, `${shape.x}vw`],
            opacity: [0, 0.4, 0.4, 0],
            scale: [0.5, 1.1, 1.1, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut"
          }}
          className="absolute text-[#FF69B4]/18 pointer-events-none select-none flex items-center justify-center"
          style={{ width: shape.size, height: shape.size }}
        >
          {shape.type === 'sparkle' && <Sparkles className="w-full h-full text-[#FF69B4]" />}
          {shape.type === 'star' && <Sparkles className="w-full h-full fill-[#FFB6D9] text-[#FFB6D9]" />}
          {shape.type === 'heart' && <Heart className="w-full h-full fill-[#FFD6E8] text-[#FFD6E8]" />}
          {shape.type === 'bow' && <span className="text-base">🎀</span>}
        </motion.div>
      ))}

      {/* Notebook card */}
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.93 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
        }}
        transition={{ 
          type: "spring",
          damping: 24, 
          stiffness: 110,
        }}
        className="w-full max-w-[420px] mx-4 pl-8 pr-6 sm:pl-14 sm:pr-8 py-10 bg-[#FFFBF7] border border-[#FFB6D9]/40 rounded-3xl shadow-[0_16px_40px_rgba(255,105,180,0.08)] relative z-10 flex flex-col items-center notebook-lines overflow-hidden"
      >
        {/* Spiral Binder Rings on the Left Edge */}
        <div className="absolute left-0 top-6 bottom-6 flex-col justify-between items-center w-6 z-20 pointer-events-none hidden min-[380px]:flex">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="relative w-full h-4 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFE5EC] shadow-inner border border-[#FFB6D9]/30" />
              <div className="absolute -left-3.5 w-6 h-3 rounded-full border-[2.2px] border-t-gray-300 border-r-gray-400 border-b-gray-400 border-l-gray-300/60 shadow-[0_2px_4px_rgba(0,0,0,0.12)] bg-transparent rotate-[-15deg] z-30" />
            </div>
          ))}
        </div>

        {/* Vertical Red Margin Line */}
        <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-red-300/40 z-10" />

        {/* Header section */}
        <div className="flex flex-col items-center gap-1.5 text-center w-full mb-6 z-10">
          <h2 className="text-3.5xl font-black text-[#FF69B4] tracking-wide font-toy-title keep-toy-font flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(255,105,180,0.1)]">
            Pink Whisper 🎀
          </h2>
          <p className="text-[10px] text-[#6D4C57]/60 font-black uppercase tracking-widest mt-1">
            unlock your secret cozy diary
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center w-full z-10"
            >
              <div className="w-20 h-20 bg-[#FFE5EC] border border-[#FFB6D9] rounded-full flex items-center justify-center text-red-400 mb-5 animate-pulse-heart">
                <Heart size={42} fill="currentColor" />
              </div>
              <h3 className="text-lg font-black text-[#FF69B4]">Connecting to Space...</h3>
              <p className="text-xs text-[#6D4C57]/60 mt-1">Opening your private lockbox ✨</p>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center z-10"
            >
              {/* Pulsing Mascot sticker */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full border-2 border-[#FFB6D9] p-1 bg-white shadow-md relative group mb-6"
              >
                <Avatar pfp="avatar:cat" className="w-full h-full rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FF69B4] rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-sm select-none">
                  🌸
                </div>
              </motion.div>

              <p className="text-xs text-[#6D4C57]/70 text-center font-bold max-w-[260px] leading-relaxed mb-6">
                Welcome back! Sign in securely with Google to load your memories, write entries, and customize your cozy layout.
              </p>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50/70 border border-red-200/50 py-1.5 px-3 rounded-xl w-full mb-4"
                >
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Google Sign-in Button */}
              <motion.button
                whileHover={{ scale: 1.04, rotate: 1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleGoogleLogin}
                className="w-full max-w-[280px] h-12 px-5 rounded-2xl border border-[#FFB6D9] hover:border-[#FF69B4] bg-white hover:bg-[#FFF5F7] text-[#6D4C57] font-black text-xs flex items-center justify-center gap-3 shadow-[0_4px_12px_rgba(255,105,180,0.06)] cursor-pointer transition-colors duration-300 mb-2"
              >
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
