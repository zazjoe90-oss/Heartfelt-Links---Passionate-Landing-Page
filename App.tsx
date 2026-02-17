
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LinkItem, SocialLink, ProfileData } from './types';
import { SOCIAL_ICONS, INITIAL_PROFILE } from './constants';
import PayPalTipButton from './components/PayPalTipButton';
import { generateBio, suggestLinks } from './services/geminiService';

// Decorative component for floating hearts background effect
const FloatingHearts = () => {
  const hearts = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${6 + Math.random() * 4}s`,
    size: `${1 + Math.random() * 2}rem`,
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {hearts.map(heart => (
        <span
          key={heart.id}
          className="absolute bottom-[-100px] text-red-400 animate-float"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            fontSize: heart.size,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Background style based on theme
  const getBackgroundStyle = () => {
    switch (profile.theme) {
      case 'passion':
        return 'bg-gradient-to-tr from-rose-50 via-red-50 to-pink-50';
      case 'gradient':
        return 'bg-gradient-to-br from-rose-100 via-indigo-100 to-teal-100';
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'glass':
        return 'bg-[url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1920")] bg-cover bg-center';
      default:
        return 'bg-white';
    }
  };

  const handleAiImprove = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const [newBio, newTitles] = await Promise.all([
          generateBio(aiPrompt),
          suggestLinks(aiPrompt)
      ]);
      setProfile(prev => ({
        ...prev,
        bio: newBio,
        links: newTitles.map((title, i) => ({
            id: String(Date.now() + i),
            title,
            url: '#'
        }))
      }));
      setAiPrompt('');
      setIsEditing(false); // Close modal on success
    } catch (err) {
      console.error(err);
      alert("AI Magic failed. Try again! ❤️");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThemeChange = (newTheme: ProfileData['theme']) => {
    setProfile(prev => ({ ...prev, theme: newTheme }));
  };

  return (
    <div className={`min-h-screen relative transition-all duration-700 pb-20 px-4 flex flex-col items-center ${getBackgroundStyle()} overflow-x-hidden`}>
      
      {/* Visual background layers */}
      <FloatingHearts />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-500 to-red-600 shadow-lg z-10"></div>

      {/* Settings Toggle (Top Right) */}
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="fixed top-6 right-6 z-50 p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-red-50 group"
      >
        <span className="sr-only">Edit Profile</span>
        {isEditing ? (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>
            <span className="hidden md:block text-xs font-black tracking-tighter text-red-600 uppercase">Magic</span>
          </div>
        )}
      </button>

      {/* Profile Header */}
      <div className="mt-20 flex flex-col items-center text-center animate-fadeIn max-w-xl w-full z-10">
        <div className="relative group p-1 bg-gradient-to-r from-red-500 to-rose-400 rounded-full shadow-2xl">
          <img 
            src={profile.avatarUrl} 
            alt={profile.name} 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white object-cover transition-transform group-hover:scale-105 duration-500"
          />
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-red-100">
             <span className="text-xl">❤️</span>
          </div>
        </div>
        
        <h1 className={`mt-8 text-3xl md:text-4xl font-black tracking-tight ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {profile.name}
        </h1>
        <p className={`mt-4 text-base md:text-lg max-w-xs md:max-w-md font-medium leading-relaxed ${profile.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {profile.bio}
        </p>

        {/* Social Icons */}
        <div className="flex flex-wrap justify-center gap-5 mt-8">
          {profile.socials.map((social) => (
            <a 
              key={social.platform} 
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-3 rounded-2xl transition-all hover:scale-125 hover:shadow-lg hover:shadow-red-200/50 ${
                profile.theme === 'dark' 
                  ? 'text-red-400 bg-gray-800 border border-gray-700' 
                  : 'text-red-500 bg-white shadow-md border border-red-50'
              }`}
            >
              {SOCIAL_ICONS[social.platform]}
            </a>
          ))}
        </div>
      </div>

      {/* Links List */}
      <div className="mt-12 w-full max-w-xl flex flex-col gap-5 z-10">
        {profile.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-5 px-8 text-center font-bold text-lg rounded-[1.5rem] transition-all hover:translate-y-[-4px] active:scale-[0.97] shadow-lg border-2 group ${
              profile.theme === 'dark' 
                ? 'bg-gray-800 border-red-900/30 text-white hover:bg-gray-700 hover:border-red-500' 
                : profile.theme === 'passion'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 border-transparent text-white hover:shadow-red-300/50'
                : profile.theme === 'glass'
                ? 'glass-card text-gray-800 hover:bg-white/60 border-white/40'
                : 'bg-white border-red-50 text-gray-800 hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
               {link.title}
               <span className="opacity-0 group-hover:opacity-100 transition-opacity">❤️</span>
            </div>
          </a>
        ))}
      </div>

      {/* PayPal Section */}
      {profile.paypalMe && <div className="z-10 w-full"><PayPalTipButton paypalUsername={profile.paypalMe} /></div>}

      {/* AI Customizer Panel */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-red-900/20 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fadeIn" onClick={() => setIsEditing(false)}>
          <div 
            className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-[0_35px_60px_-15px_rgba(220,38,38,0.3)] animate-slideUp overflow-y-auto max-h-[90vh] border border-red-100" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        Profile Magic <span className="text-red-500 animate-pulse">✨❤️</span>
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Let AI craft your heartfelt brand.</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="space-y-8">
                {/* AI Input */}
                <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">About You ❤️</label>
                    <textarea 
                        className="w-full p-5 border-2 border-red-50 rounded-3xl bg-red-50/30 focus:ring-4 focus:ring-red-100 focus:border-red-300 focus:outline-none transition-all text-gray-800 placeholder-red-200"
                        placeholder="I'm a heart-centered creator who loves red..."
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button 
                        onClick={handleAiImprove}
                        disabled={isGenerating || !aiPrompt}
                        className="w-full mt-4 py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-lg rounded-2xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-200"
                    >
                        {isGenerating ? (
                            <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>✨ Spark Romance</>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-[2px] bg-red-50" />
                    <span className="text-[10px] font-black text-red-200 uppercase tracking-[0.2em]">Customization</span>
                    <div className="flex-1 h-[2px] bg-red-50" />
                </div>

                {/* Theme Selector */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Vibe Check 🌹</label>
                    <div className="grid grid-cols-2 gap-4">
                        {(['passion', 'gradient', 'glass', 'dark'] as const).map((t) => (
                            <button 
                                key={t}
                                onClick={() => handleThemeChange(t)}
                                className={`py-3 px-4 rounded-2xl border-2 capitalize text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    profile.theme === t 
                                    ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200' 
                                    : 'bg-white border-red-50 text-red-400 hover:border-red-200'
                                }`}
                            >
                                {t === 'passion' ? '❤️ Passion' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Manual Edit Name */}
                <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">Public Name ❤️</label>
                    <input 
                        className="w-full px-6 py-4 border-2 border-red-50 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-300 focus:outline-none transition-all font-bold text-gray-800"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 text-red-400 text-xs text-center z-10 font-bold uppercase tracking-widest opacity-60">
        <p>&copy; 2024 HEARTFELT LINKS ✨</p>
        <p className="mt-2 flex items-center justify-center gap-1">Crafted with Love <span className="animate-pulse">❤️</span> and Gemini AI</p>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
