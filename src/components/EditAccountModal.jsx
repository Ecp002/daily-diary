import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Flame, Key, Camera, Save, LogOut, Heart } from 'lucide-react';
import Avatar from './Avatar';

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

export default function EditAccountModal({ isOpen, onClose, userProfile, onSave, onLogout }) {
  const [username, setUsername] = useState('');
  const [streak, setStreak] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [error, setError] = useState('');

  // Load profile values on open
  useEffect(() => {
    if (isOpen && userProfile) {
      setUsername(userProfile.username || '');
      setStreak(userProfile.streak || 1);
      
      const storedPfp = localStorage.getItem('pink_whisper_pfp') || '';
      setSelectedAvatar(storedPfp);
      
      const isPredefined = PREDEFINED_AVATARS.some(a => a.url === storedPfp);
      if (!isPredefined && storedPfp.startsWith('data:image')) {
        setCustomAvatar(storedPfp);
      } else {
        setCustomAvatar('');
      }
      setError('');
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

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

  const handleSave = () => {
    if (!username.trim()) {
      setError('Username cannot be empty! 🌸');
      return;
    }

    // Save to localStorage
    localStorage.setItem('pink_whisper_username', username.trim());
    localStorage.setItem('pink_whisper_pfp', selectedAvatar);
    localStorage.setItem('pink_whisper_streak', streak.toString());

    // Trigger save callback to update parent state
    onSave({
      username: username.trim(),
      pfp: selectedAvatar,
      streak: parseInt(streak, 10)
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden font-cute">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/25 backdrop-blur-sm z-0"
        />

        {/* Modal Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-[450px] mx-4 p-7 bg-[#FFF9F5]/95 border border-[#FFB6D9]/40 rounded-3xl shadow-[0_16px_48px_rgba(255,105,180,0.1)] relative z-10 max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          {/* Close Header button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FFE5EC]/40 text-[#6D4C57]/60 hover:text-[#FF69B4] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Heading title */}
          <div className="flex items-center gap-2 mb-6 border-b border-[#FFB6D9]/20 pb-3">
            <div className="w-8 h-8 rounded-full bg-[#FFE5EC] flex items-center justify-center text-[#FF69B4]">
              <Heart size={16} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#6D4C57]">Edit Account Details</h3>
              <p className="text-[10px] text-[#6D4C57]/50 font-semibold uppercase tracking-wider">Customize your cozy profile</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Avatar choosing segment */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full border-2 border-[#FFB6D9] p-1 bg-white relative shadow-sm group">
                <Avatar
                  pfp={selectedAvatar || 'avatar:cat'}
                  className="w-full h-full rounded-full"
                />
                <label className="absolute bottom-0 right-0 w-6.5 h-6.5 bg-[#FF69B4] hover:bg-[#FFB6D9] rounded-full border-2 border-[#FFF9F5] flex items-center justify-center text-white cursor-pointer shadow-sm transition-all duration-200">
                  <Camera size={11} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleCustomPfpUpload} />
                </label>
              </div>

              <div className="flex flex-col items-center w-full">
                <span className="text-[11px] font-bold text-[#6D4C57]/60 mb-2">Choose Predefined Avatar</span>
                <div className="grid grid-cols-4 gap-3 justify-items-center max-w-[220px]">
                  {PREDEFINED_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => {
                          setSelectedAvatar(avatar.url);
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                          isSelected ? 'border-[#FF69B4] scale-110 shadow-sm' : 'border-[#FFB6D9]/20 hover:border-[#FFB6D9]/50'
                        }`}
                        title={avatar.label}
                      >
                        <Avatar pfp={avatar.url} className="w-full h-full rounded-full" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="flex flex-col gap-4">
              {/* Nickname input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-[#6D4C57]/70 flex items-center gap-1.5">
                  <User size={13} className="text-[#FF69B4]" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={15}
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#FFB6D9]/20 focus:border-[#FF69B4] text-xs font-bold text-[#6D4C57] outline-none transition-all"
                  placeholder="e.g. Esha 🌸"
                />
              </div>

              {/* Streak input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-[#6D4C57]/70 flex items-center gap-1.5">
                  <Flame size={13} className="text-[#FF69B4]" />
                  <span>Streak Days</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={streak}
                  onChange={(e) => setStreak(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#FFB6D9]/20 focus:border-[#FF69B4] text-xs font-bold text-[#6D4C57] outline-none transition-all"
                />
              </div>

            </div>

            {/* Error Message */}
            {error && (
              <div className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 py-1.5 px-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* CTA action buttons */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={handleSave}
                className="w-full h-10.5 rounded-xl bg-gradient-to-r from-[#FF69B4] to-[#FFB6D9] hover:opacity-95 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(255,105,180,0.15)] cursor-pointer"
              >
                <Save size={14} />
                <span>Save Changes</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out of your safe space? 🔒')) {
                    onLogout();
                    onClose();
                  }
                }}
                className="w-full h-10.5 rounded-xl border border-red-200 hover:bg-red-50/50 text-red-500 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                <span>Log Out of Diary</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
