
import React, { useState, useMemo } from 'react';
import { ProfileData } from './types';
import { SOCIAL_ICONS, INITIAL_PROFILE } from './constants';
import PayPalTipButton from './components/PayPalTipButton';
import { generateBio, suggestLinks } from './services/geminiService';

const FloatingHearts = () => {
  const hearts = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 6}s`,
    size: `${0.8 + Math.random() * 1.5}rem`,
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
      {hearts.map(heart => (
        <span
          key={heart.id}
          className="absolute bottom-[-100px] text-red-300 animate-float-heart"
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

  const getBackgroundStyle = () => {
    switch (profile.theme) {
      case 'passion':
        return 'bg-gradient-to-tr from-rose-50 via-red-50 to-pink-100';
      case 'gradient':
        return 'bg-gradient-to-br from-rose-100 via-indigo-100 to-teal-100';
      case 'dark':
        return 'bg-gray-950 text-white';
      case 'glass':
        return 'bg-[url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1920")] bg-cover bg-center bg-fixed';
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
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("AI magic needed a coffee break. Try again! ❤️");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen relative transition-all duration-1000 pb-24 px-4 flex flex-col items-center ${getBackgroundStyle()} overflow-x-hidden`}>
      <FloatingHearts />
      
      {/* Premium Top Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 shadow-md z-20"></div>

      {/* Editor Trigger */}
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="fixed top-6 right-6 z-50 p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border border-red-50 group flex items-center gap-3 overflow-hidden"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-xs font-black tracking-widest text-red-600 uppercase group-hover:tracking-[0.2em] transition-all">
          {isEditing ? 'Close' : 'Customize'}
        </span>
      </button>

      {/* Profile Section */}
      <div className="mt-24 flex flex-col items-center text-center animate-profileIn max-w-xl w-full z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
          <div className="relative p-1 bg-gradient-to-br from-red-500 via-rose-400 to-pink-500 rounded-full shadow-[0_20px_50px_rgba(239,68,68,0.3)] group-hover:shadow-[0_20px_60px_rgba(239,68,68,0.5)] transition-all duration-500">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white object-cover animate-heartbeat"
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-2.5 rounded-full shadow-lg border border-red-50 scale-110">
               <span className="text-xl">✨</span>
            </div>
          </div>
        </div>
        
        <h1 className={`mt-10 text-3xl md:text-5xl font-black tracking-tighter ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {profile.name}
        </h1>
        <p className={`mt-5 text-base md:text-xl max-w-xs md:max-w-lg font-medium leading-relaxed opacity-90 ${profile.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {profile.bio}
        </p>

        {/* Socials */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {profile.socials.map((social) => (
            <a 
              key={social.platform} 
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-4 rounded-3xl transition-all hover:scale-125 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/30 ${
                profile.theme === 'dark' 
                  ? 'text-red-400 bg-gray-900 border border-gray-800' 
                  : 'text-red-600 bg-white shadow-xl shadow-red-50 border border-red-50'
              }`}
            >
              {SOCIAL_ICONS[social.platform]}
            </a>
          ))}
        </div>
      </div>

      {/* Links List */}
      <div className="mt-14 w-full max-w-xl flex flex-col gap-6 z-10 px-2">
        {profile.links.map((link, idx) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ animationDelay: `${idx * 0.1}s` }}
            className={`w-full py-5 px-8 text-center font-extrabold text-lg md:text-xl rounded-3xl transition-all hover:translate-y-[-6px] active:scale-[0.96] shadow-xl border-2 group animate-linkFadeIn ${
              profile.theme === 'dark' 
                ? 'bg-gray-900 border-red-900/40 text-white hover:border-red-500 hover:shadow-red-500/20' 
                : profile.theme === 'passion'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 border-transparent text-white hover:shadow-red-400/40'
                : 'bg-white border-red-50 text-gray-900 hover:border-red-400 hover:shadow-red-100'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
               <span className="group-hover:rotate-12 transition-transform">❤️</span>
               {link.title}
               <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">✨</span>
            </div>
          </a>
        ))}
      </div>

      {/* Tipping Section */}
      {profile.paypalMe && <div className="z-10 w-full mt-4"><PayPalTipButton paypalUsername={profile.paypalMe} /></div>}

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-red-950/40 backdrop-blur-xl flex items-end sm:items-center justify-center p-4" onClick={() => setIsEditing(false)}>
          <div 
            className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-[0_40px_100px_-15px_rgba(220,38,38,0.4)] animate-modalIn border border-red-100" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Vibe Editor 🎨</h2>
                    <p className="text-red-400 font-bold text-sm mt-1 uppercase tracking-widest">Personalize with Love</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-3 bg-red-50 rounded-2xl text-red-500 hover:bg-red-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">AI Bio Creator</label>
                    <textarea 
                        className="w-full p-6 border-2 border-red-50 rounded-3xl bg-red-50/20 focus:ring-4 focus:ring-red-100 focus:border-red-300 focus:outline-none transition-all text-gray-800 font-medium text-lg placeholder-red-200"
                        placeholder="What's your story today? ❤️"
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button 
                        onClick={handleAiImprove}
                        disabled={isGenerating || !aiPrompt}
                        className="w-full mt-5 py-5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xl rounded-[2rem] hover:shadow-2xl hover:shadow-red-200 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                        {isGenerating ? (
                            <div className="w-6 h-6 border-[4px] border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Generate Magic ✨</>
                        )}
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Visual Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                        {(['passion', 'gradient', 'glass', 'dark'] as const).map((t) => (
                            <button 
                                key={t}
                                onClick={() => setProfile({...profile, theme: t})}
                                className={`py-4 px-6 rounded-2xl border-2 capitalize font-black transition-all ${
                                    profile.theme === t 
                                    ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200' 
                                    : 'bg-white border-red-50 text-red-300 hover:border-red-100 hover:text-red-500'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 text-red-300 text-[10px] font-black uppercase tracking-[0.4em] text-center z-10">
        <p>&copy; 2024 Monica Oberoi</p>
        <p className="mt-3 flex items-center justify-center gap-2 opacity-50">
          Created with Passion <span className="animate-bounce">🌹</span> and AI
        </p>
      </footer>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-heartbeat { animation: heartbeat 4s ease-in-out infinite; }

        @keyframes float-heart {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-heart { animation: float-heart linear infinite; }

        @keyframes profileIn {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-profileIn { animation: profileIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes linkFadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-linkFadeIn { animation: linkFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-modalIn { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
