import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Sparkles, Heart, ArrowRight, BookOpen, Key, AlertCircle, RefreshCw } from 'lucide-react';
import Avatar from './Avatar';
import FloatingHearts from './FloatingHearts';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const PREDEFINED_AVATARS = [
  { id: 'girl1', label: 'Cozy Girl', url: 'avatar:girl1' },
  { id: 'girl2', label: 'Pastel Girl', url: 'avatar:girl2' },
  { id: 'boy1', label: 'Cozy Boy', url: 'avatar:boy1' },
  { id: 'boy2', label: 'Pastel Boy', url: 'avatar:boy2' },
  { id: 'cat', label: 'Cozy Cat', url: 'avatar:cat' },
  { id: 'bunny', label: 'Fluffy Bunny', url: 'avatar:bunny' },
  { id: 'teddy', label: 'Teddy Bear', url: 'avatar:teddy' },
  { id: 'cake', label: 'Sweet Cake', url: 'avatar:cake' }
];

// Generate random coordinates and attributes for floating background icons
const FLOATING_SHAPES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  size: Math.random() * 16 + 14,
  x: Math.random() * 90 + 5,
  y: Math.random() * 85 + 5,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 7,
  type: ['sparkle', 'star', 'heart', 'bow'][i % 4]
}));

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PREDEFINED_AVATARS[0].url);
  const [customAvatar, setCustomAvatar] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Input focus states for icon animations
  const [userFocused, setUserFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);

  // Retrieve current profile or initialize default Esha profile
  const [savedProfile, setSavedProfile] = useState(null);
  const isSubmittingRef = useRef(false);

  const getFirebaseCredentials = (name, rawPin) => {
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanName}@pinkwhisper.diary`;
    const password = `pw_${rawPin}_whisper`;
    return { email, password };
  };

  const getLoginPfp = () => {
    if (savedProfile && username.trim().toLowerCase() === savedProfile.username.trim().toLowerCase()) {
      return savedProfile.pfp;
    }
    return 'avatar:cat';
  };

  useEffect(() => {
    // Check local storage for initial UI text fallback
    const savedName = localStorage.getItem('pink_whisper_username');
    const savedPfp = localStorage.getItem('pink_whisper_pfp');
    const savedPin = localStorage.getItem('pink_whisper_pin');

    if (savedName && savedPin) {
      setSavedProfile({
        username: savedName,
        pfp: savedPfp || PREDEFINED_AVATARS[0].url,
        pin: savedPin
      });
      setUsername(savedName);
    } else {
      setSavedProfile({
        username: 'Esha',
        pfp: PREDEFINED_AVATARS[0].url,
        pin: '1111'
      });
      setUsername('Esha');
    }

    // Register a Firebase auth state listener
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
                pfp: PREDEFINED_AVATARS[0].url,
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

  const handleCustomPfpUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result);
        setSelectedAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    isSubmittingRef.current = true;

    if (isRegistering) {
      if (!username.trim()) {
        showError('Please set a username 🌸');
        return;
      }
      if (pin.length < 4) {
        showError('PIN code must be at least 4 digits 🔒');
        return;
      }

      const { email, password } = getFirebaseCredentials(username, pin);
      try {
        setIsSuccess(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        const profile = {
          username: username.trim(),
          pfp: selectedAvatar,
          streak: 1
        };

        // Non-blocking Firestore save
        try {
          await setDoc(doc(db, "users", uid), profile);
        } catch (fsErr) {
          console.error("Firestore registration write failed:", fsErr);
        }

        // Always sync local storage user-specific cache
        localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(profile));
        localStorage.setItem(`pink_whisper_entries_${uid}`, JSON.stringify([]));

        localStorage.setItem('pink_whisper_username', username.trim());
        localStorage.setItem('pink_whisper_pfp', selectedAvatar);
        localStorage.setItem('pink_whisper_pin', pin);
        localStorage.setItem('pink_whisper_streak', '1');

        setTimeout(() => {
          onLogin(profile);
        }, 1200);
      } catch (err) {
        isSubmittingRef.current = false;
        setIsSuccess(false);
        let errorMsg = 'Failed to create account. Please try again! 🌸';
        if (err.code === 'auth/email-already-in-use') {
          errorMsg = 'That username is already taken! Please try another one 🎀';
        } else if (err.code === 'auth/weak-password') {
          errorMsg = 'PIN must be more secure or longer! 🔒';
        } else {
          console.error(err);
        }
        showError(errorMsg);
      }
    } else {
      if (!username.trim() || pin.length < 4) {
        showError('Please input username and PIN! 🤫🗝️');
        return;
      }

      const { email, password } = getFirebaseCredentials(username, pin);
      try {
        setIsSuccess(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        let profile = {
          username: username.trim(),
          pfp: selectedAvatar,
          streak: parseInt(localStorage.getItem('pink_whisper_streak') || '1', 10)
        };

        // Non-blocking Firestore fetch with localStorage fallback
        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            profile = docSnap.data();
          } else {
            await setDoc(docRef, profile);
          }
        } catch (fsErr) {
          console.error("Firestore login query/save failed, falling back to local cache:", fsErr);
          const cached = localStorage.getItem(`pink_whisper_profile_${uid}`);
          if (cached) {
            profile = JSON.parse(cached);
          } else {
            profile = {
              username: username.trim(),
              pfp: selectedAvatar,
              streak: 1
            };
          }
        }

        // Always sync local storage user-specific cache
        localStorage.setItem(`pink_whisper_profile_${uid}`, JSON.stringify(profile));

        const triggerHearts = () => {
          const event = new CustomEvent('spawn-cute-heart', {
            detail: { count: 30, x: window.innerWidth / 2, y: window.innerHeight / 2, isBurst: true }
          });
          window.dispatchEvent(event);
        };
        triggerHearts();

        localStorage.setItem('pink_whisper_username', profile.username);
        localStorage.setItem('pink_whisper_pfp', profile.pfp);
        localStorage.setItem('pink_whisper_pin', pin);
        localStorage.setItem('pink_whisper_streak', profile.streak.toString());

        setTimeout(() => {
          onLogin(profile);
        }, 1200);
      } catch (err) {
        isSubmittingRef.current = false;
        setIsSuccess(false);
        let errorMsg = 'Oops! Wrong credentials or connection issues 🤫🗝️';
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          errorMsg = 'Oops! Wrong key to the diary 🤫🗝️';
        }
        showError(errorMsg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    isSubmittingRef.current = true;
    try {
      const provider = new GoogleAuthProvider();
      setIsSuccess(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;

      // Check if user has an existing profile in Firestore
      let profile = {
        username: user.displayName || user.email.split('@')[0] || 'Cozy Explorer',
        pfp: user.photoURL || PREDEFINED_AVATARS[0].url,
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
        showError('Google sign in failed! Please try again 🌸');
      }
    }
  };

  const showError = (msg) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleResetProfile = () => {
    if (window.confirm('Would you like to reset this profile and start a fresh diary? This will clear your credentials.')) {
      localStorage.removeItem('pink_whisper_username');
      localStorage.removeItem('pink_whisper_pfp');
      localStorage.removeItem('pink_whisper_pin');
      localStorage.removeItem('pink_whisper_streak');
      setSavedProfile(null);
      setUsername('');
      setPin('');
      setIsRegistering(true);
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

  // Typing heart trigger
  const handleTypingHeart = (e) => {
    const input = e.target;
    const rect = input.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    window.dispatchEvent(
      new CustomEvent('spawn-cute-heart', {
        detail: { count: 1, x, y, isBurst: true }
      })
    );
  };

  // Stagger animation container config for form inputs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 260, damping: 18 }
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
          x: isShaking ? [0, -10, 10, -10, 10, -5, 5, 0] : 0
        }}
        transition={{ 
          type: "spring",
          damping: 24, 
          stiffness: 110,
          x: { duration: 0.4 }
        }}
        className="w-full max-w-[430px] mx-2 min-[380px]:mx-4 pl-6 pr-6 min-[380px]:pl-10 min-[380px]:pr-6 sm:pl-14 sm:pr-8 py-6 min-[380px]:py-8 bg-[#FFFBF7] border border-[#FFB6D9]/40 rounded-3xl shadow-[0_16px_40px_rgba(255,105,180,0.08)] relative z-10 flex flex-col items-center notebook-lines overflow-hidden"
      >
        {/* Spiral Binder Rings on the Left Edge */}
        <div className="hidden min-[380px]:flex absolute left-0 top-6 bottom-6 flex-col justify-between items-center w-6 z-20 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="relative w-full h-4 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFE5EC] shadow-inner border border-[#FFB6D9]/30" />
              <div className="absolute -left-3.5 w-6 h-3 rounded-full border-[2.2px] border-t-gray-300 border-r-gray-400 border-b-gray-400 border-l-gray-300/60 shadow-[0_2px_4px_rgba(0,0,0,0.12)] bg-transparent rotate-[-15deg] z-30" />
            </div>
          ))}
        </div>

        {/* Vertical Red Margin Line */}
        <div className="absolute left-6 min-[380px]:left-10 top-0 bottom-0 w-0.5 bg-red-300/40 z-10" />

        {/* Header section */}
        <div className="flex flex-col items-center gap-1 mt-3 mb-6 text-center w-full">
          <h2 className="text-3xl font-black text-[#FF69B4] tracking-wide font-toy-title keep-toy-font flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(255,105,180,0.1)]">
            Pink Whisper
          </h2>
          <p className="text-[10px] text-[#6D4C57]/60 font-black uppercase tracking-widest mt-1">
            {isRegistering ? 'Setup Cozy Space' : 'Unlocking Secret Lockbox'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center w-full"
            >
              <div className="w-20 h-20 bg-[#FFE5EC] border border-[#FFB6D9] rounded-full flex items-center justify-center text-red-400 mb-4 animate-pulse-heart">
                <Heart size={42} fill="currentColor" />
              </div>
              <h3 className="text-lg font-black text-[#FF69B4]">Opening Secret Lockbox...</h3>
              <p className="text-xs text-[#6D4C57]/60 mt-1">Sticker album & tape ready! ✨</p>
            </motion.div>
          ) : (
            <motion.form
              key={isRegistering ? 'register' : 'login'}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="w-full flex flex-col items-center gap-5 z-10"
            >
              {!isRegistering ? (
                <motion.div 
                  variants={itemVariants} 
                  className="flex flex-col items-center gap-2 mb-2 w-full"
                >
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-full border-2 border-[#FFB6D9] p-1 bg-white shadow-md relative group"
                  >
                    <Avatar pfp={getLoginPfp()} className="w-full h-full rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF69B4] rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] shadow-sm">
                      🔒
                    </div>
                  </motion.div>
                  {savedProfile && username.trim().toLowerCase() === savedProfile.username.trim().toLowerCase() && (
                    <h4 className="text-xs font-black text-[#6D4C57] mt-1">
                      Welcome Back, {savedProfile.username}! 🌸
                    </h4>
                  )}
                </motion.div>
              ) : (
                /* Avatar Selection with stickers */
                <motion.div 
                  variants={itemVariants} 
                  className="w-full flex flex-col items-center gap-3"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6D4C57]/60">Select Avatar Sticker</span>
                  <div className="grid grid-cols-4 gap-3.5 max-w-[280px]">
                    {PREDEFINED_AVATARS.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.url && !customAvatar;
                      return (
                        <div key={avatar.id} className="relative">
                          {isSelected && (
                            <motion.div 
                              layoutId="washiTape"
                              className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-[#FF69B4]/35 border-l border-r border-[#FF69B4]/10 rotate-[-5deg] z-10 select-none"
                            />
                          )}
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 3 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(avatar.url);
                              setCustomAvatar('');
                            }}
                            className={`w-11 h-11 rounded-full p-0.5 border-2 transition-all duration-300 ${
                              isSelected ? 'border-[#FF69B4] scale-110 shadow-sm' : 'border-[#FFB6D9]/30 opacity-60 hover:opacity-95'
                            }`}
                            title={avatar.label}
                          >
                            <Avatar pfp={avatar.url} className="w-full h-full rounded-full" />
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Custom upload button */}
                  <motion.label 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-36 h-8 rounded-full border border-dashed flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold text-[#FF69B4] bg-white/55 transition-all ${
                      customAvatar ? 'border-[#FF69B4] shadow-sm bg-[#FFE5EC]/30' : 'border-[#FFB6D9]/50 hover:bg-[#FFE5EC]/30'
                    }`}
                  >
                    {customAvatar ? (
                      <>
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-[#FF69B4]/30">
                          <img src={customAvatar} className="w-full h-full object-cover" alt="Custom" />
                        </div>
                        <span>Custom Active</span>
                      </>
                    ) : (
                      <span>+ Custom Photo</span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCustomPfpUpload} />
                  </motion.label>
                </motion.div>
              )}

              {/* Username Input with expand transition */}
              <motion.div variants={itemVariants} className="w-full flex flex-col gap-1">
                <label className="text-xs font-black text-[#6D4C57]/70 px-1 flex items-center gap-1.5">
                  <User 
                    size={12} 
                    className={`transition-transform duration-300 ${userFocused ? 'rotate-12 scale-110 text-[#FF69B4]' : 'text-[#6D4C57]/45'}`} 
                  />
                  <span>Username</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="e.g. Esha 🧸"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      handleTypingHeart(e);
                    }}
                    maxLength={15}
                    onFocus={() => setUserFocused(true)}
                    onBlur={() => setUserFocused(false)}
                    className="w-full h-10 px-1.5 bg-transparent text-sm font-bold text-[#6D4C57] placeholder-[#6D4C57]/30 outline-none transition-all"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FFB6D9]/20" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: userFocused ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF69B4] origin-center"
                  />
                </div>
              </motion.div>

              {/* PIN Input with expand transition */}
              <motion.div variants={itemVariants} className="w-full flex flex-col gap-1">
                <label className="text-xs font-black text-[#6D4C57]/70 px-1 flex items-center gap-1.5">
                  <Lock 
                    size={12} 
                    className={`transition-transform duration-300 ${pinFocused ? 'rotate-12 scale-110 text-[#FF69B4]' : 'text-[#6D4C57]/45'}`} 
                  />
                  <span>{isRegistering ? 'Create Secret PIN (4-digit number)' : 'Enter Secret PIN'}</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPin(val);
                      handleTypingHeart(e);
                    }}
                    onFocus={() => setPinFocused(true)}
                    onBlur={() => setPinFocused(false)}
                    className="w-full h-10 px-1.5 bg-transparent text-center tracking-[0.6em] font-mono text-lg font-bold text-[#6D4C57] placeholder-[#6D4C57]/30 outline-none transition-all"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[#FFB6D9]/80 pointer-events-none">
                    <Key size={14} className={pinFocused ? "animate-pulse" : ""} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FFB6D9]/20" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: pinFocused ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF69B4] origin-center"
                  />
                </div>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50/70 border border-red-200/50 py-1.5 px-3 rounded-xl w-full"
                >
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Google Sign-in Button */}
              <motion.div variants={itemVariants} className="w-full flex justify-center mt-2">
                <motion.button
                  whileHover={{ scale: 1.04, rotate: 1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-10 px-4 rounded-xl border border-[#FFB6D9]/40 hover:border-[#FF69B4]/60 bg-white/70 hover:bg-[#FFF5F7]/80 text-[#6D4C57] font-bold text-xs flex items-center justify-center gap-2.5 shadow-[0_2px_8px_rgba(255,105,180,0.04)] cursor-pointer transition-colors duration-300"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="w-full flex items-center justify-center gap-2.5 my-1.5 opacity-60">
                <div className="h-[1px] flex-1 bg-[#FFB6D9]/30" />
                <span className="text-[9px] font-black uppercase tracking-wider text-[#6D4C57]/40">or unlock with pin</span>
                <div className="h-[1px] flex-1 bg-[#FFB6D9]/30" />
              </motion.div>

              {/* Ribbon Bow Submit button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="relative cursor-pointer select-none mt-1 drop-shadow-[0_4px_10px_rgba(255,105,180,0.22)] focus:outline-none shrink-0"
                >
                  <svg
                    width="180"
                    height="125"
                    viewBox="0 0 100 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-bow-wiggle"
                  >
                    <defs>
                      <linearGradient id="btnBowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF69B4" />
                        <stop offset="40%" stopColor="#FF8EBF" />
                        <stop offset="100%" stopColor="#FFB6D9" />
                      </linearGradient>
                      <linearGradient id="btnTailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF69B4" />
                        <stop offset="100%" stopColor="#FFB6D9" />
                      </linearGradient>
                    </defs>
                    
                    <path
                      d="M 45 42 C 35 55 18 72 15 75 C 20 75 30 68 40 58 C 45 53 47 48 48 45 Z"
                      fill="url(#btnTailGrad)"
                      stroke="#E0559C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M 55 42 C 65 55 82 72 85 75 C 80 75 70 68 60 58 C 55 53 53 48 52 45 Z"
                      fill="url(#btnTailGrad)"
                      stroke="#E0559C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M 45 38 C 25 12 5 28 12 48 C 18 64 38 52 47 42 Z"
                      fill="url(#btnBowGrad)"
                      stroke="#E0559C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M 55 38 C 75 12 95 28 88 48 C 82 64 62 52 53 42 Z"
                      fill="url(#btnBowGrad)"
                      stroke="#E0559C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <rect
                      x="36"
                      y="28"
                      width="28"
                      height="23"
                      rx="8"
                      fill="url(#btnBowGrad)"
                      stroke="#E0559C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    <path d="M 37 38 C 31 34 27 36 25 40" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                    <path d="M 63 38 C 69 34 73 36 75 40" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                  </svg>
                  
                  <span className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[9px] font-black uppercase tracking-widest pointer-events-none drop-shadow-[0_1.5px_3px_rgba(109,24,65,0.5)]">
                    {isRegistering ? 'Setup' : 'Unlock'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Bottom toggles */}
              <motion.div 
                variants={itemVariants}
                className="flex w-full justify-between items-center mt-1 px-1 text-[11px] font-bold text-[#6D4C57]/55"
              >
                {isRegistering ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      if (savedProfile) {
                        setUsername(savedProfile.username);
                      }
                      setPin('');
                      setError('');
                    }}
                    className="hover:text-[#FF69B4] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <BookOpen size={11} />
                    <span>Already have a diary? Unlock here</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        setUsername('');
                        setPin('');
                        setError('');
                      }}
                      className="hover:text-[#FF69B4] transition-colors cursor-pointer"
                    >
                      New Profile?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('');
                        setPin('');
                        setError('');
                      }}
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear Fields
                    </button>
                  </>
                )}
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
