
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ProfileData } from './types';
import { SOCIAL_ICONS, INITIAL_PROFILE } from './constants';
import PayPalTipButton from './components/PayPalTipButton';
import { generateBio, suggestLinks } from './services/geminiService';

interface BurstEmoji {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const DECORATIONS = ['❤️', '💖', '✨', '🌹', '💕', '🔥'];

const FloatingDecorations = () => {
  const items = useMemo(() => Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 8}s`,
    size: `${0.8 + Math.random() * 2}rem`,
    emoji: DECORATIONS[Math.floor(Math.random() * DECORATIONS.length)],
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {items.map(item => (
        <span
          key={item.id}
          className="absolute bottom-[-100px] animate-float-decoration select-none"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            fontSize: item.size,
          }}
        >
          {item.emoji}
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
  const [bursts, setBursts] = useState<BurstEmoji[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only trigger burst if not clicking a button or link
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) return;

    const newBurst: BurstEmoji = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      emoji: DECORATIONS[Math.floor(Math.random() * DECORATIONS.length)],
    };

    setBursts(prev => [...prev.slice(-10), newBurst]);
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== newBurst.id));
    }, 1000);
  }, []);

  const getBackgroundStyle = () => {
    switch (profile.theme) {
      case 'passion':
        return 'bg-gradient-to-tr from-rose-100 via-red-50 to-pink-200';
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
    <div 
      onClick={handleClick}
      className={`min-h-screen relative transition-all duration-1000 pb-24 px-4 flex flex-col items-center ${getBackgroundStyle()} overflow-x-hidden cursor-default`}
    >
      <FloatingDecorations />
      
      {/* Interactive Mouse Glow */}
      <div 
        className="fixed pointer-events-none w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-all duration-300 z-0 bg-red-400"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* Burst Effect Layer */}
      {bursts.map(burst => (
        <span
          key={burst.id}
          className="fixed pointer-events-none z-50 animate-burst select-none text-2xl"
          style={{ left: burst.x, top: burst.y }}
        >
          {burst.emoji}
        </span>
      ))}
      
      {/* Premium Top Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-xl z-20"></div>

      {/* Editor Trigger */}
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="fixed top-6 right-6 z-50 p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border border-red-100 group flex items-center gap-3 overflow-hidden"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-xs font-black tracking-widest text-red-600 uppercase group-hover:tracking-[0.2em] transition-all">
          {isEditing ? 'Close' : 'Vibe Edit'}
        </span>
      </button>

      {/* Profile Section */}
      <div className="mt-28 flex flex-col items-center text-center animate-profileIn max-w-xl w-full z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity animate-pulse"></div>
          <div className="relative p-1.5 bg-gradient-to-br from-red-600 via-rose-400 to-pink-500 rounded-full shadow-[0_25px_60px_rgba(239,68,68,0.4)] group-hover:shadow-[0_25px_80px_rgba(239,68,68,0.6)] transition-all duration-700 hover:rotate-2">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-36 h-36 md:w-48 md:h-48 rounded-full border-[8px] border-white object-cover animate-heartbeat"
            />
            <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-2xl border border-red-50 scale-125 animate-bounce">
               <span className="text-2xl">🌹</span>
            </div>
          </div>
        </div>
        
        <h1 className={`mt-12 text-4xl md:text-6xl font-black tracking-tighter ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'} drop-shadow-sm`}>
          {profile.name}
        </h1>
        <p className={`mt-6 text-lg md:text-2xl max-w-sm md:max-w-xl font-semibold leading-relaxed opacity-90 ${profile.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {profile.bio}
        </p>

        {/* Socials */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {profile.socials.map((social) => (
            <a 
              key={social.platform} 
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-5 rounded-[2rem] transition-all hover:scale-125 hover:-translate-y-3 hover:shadow-2xl hover:shadow-red-500/40 ${
                profile.theme === 'dark' 
                  ? 'text-red-400 bg-gray-900 border-2 border-gray-800' 
                  : 'text-red-600 bg-white shadow-xl shadow-red-100 border-2 border-red-50'
              }`}
            >
              {SOCIAL_ICONS[social.platform]}
            </a>
          ))}
        </div>
      </div>

      {/* Links List */}
      <div className="mt-16 w-full max-w-xl flex flex-col gap-6 z-10 px-2">
        {profile.links.map((link, idx) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ animationDelay: `${idx * 0.15}s` }}
            className={`w-full py-6 px-10 text-center font-black text-xl md:text-2xl rounded-[2.5rem] transition-all hover:translate-y-[-8px] active:scale-[0.95] shadow-2xl border-4 group animate-linkFadeIn ${
              profile.theme === 'dark' 
                ? 'bg-gray-900 border-red-900/50 text-white hover:border-red-500 hover:shadow-red-500/30' 
                : profile.theme === 'passion'
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-500 border-white/20 text-white hover:shadow-red-400/60'
                : 'bg-white border-red-50 text-gray-900 hover:border-red-500 hover:shadow-red-200'
            }`}
          >
            <div className="flex items-center justify-center gap-4">
               <span className="group-hover:rotate-[360deg] transition-transform duration-700">❤️</span>
               {link.title}
               <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">✨</span>
            </div>
          </a>
        ))}
      </div>

      {/* Tipping Section */}
      {profile.paypalMe && <div className="z-10 w-full mt-8 scale-105"><PayPalTipButton paypalUsername={profile.paypalMe} /></div>}

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-red-950/50 backdrop-blur-2xl flex items-end sm:items-center justify-center p-4" onClick={() => setIsEditing(false)}>
          <div 
            className="bg-white rounded-[4rem] w-full max-w-xl p-12 shadow-[0_50px_120px_-20px_rgba(220,38,38,0.5)] animate-modalIn border-2 border-red-100 overflow-hidden relative" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -z-10 opacity-50"></div>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Vibe Design ❤️</h2>
                    <p className="text-red-500 font-bold text-base mt-2 uppercase tracking-widest flex items-center gap-2">
                        Crafted for Monica <span className="animate-pulse">🌹</span>
                    </p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-4 bg-red-50 rounded-3xl text-red-500 hover:bg-red-100 transition-all hover:rotate-90">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="space-y-10">
                <div>
                    <label className="block text-sm font-black text-gray-400 mb-5 uppercase tracking-[0.3em]">AI Heartbeat Bio</label>
                    <textarea 
                        className="w-full p-8 border-3 border-red-50 rounded-[2.5rem] bg-red-50/20 focus:ring-8 focus:ring-red-100 focus:border-red-400 focus:outline-none transition-all text-gray-800 font-bold text-xl placeholder-red-200"
                        placeholder="What's your love language today? ❤️"
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button 
                        onClick={handleAiImprove}
                        disabled={isGenerating || !aiPrompt}
                        className="w-full mt-6 py-6 bg-gradient-to-r from-red-600 via-rose-500 to-pink-600 text-white font-black text-2xl rounded-[2.5rem] hover:shadow-3xl hover:shadow-red-300 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-5"
                    >
                        {isGenerating ? (
                            <div className="w-8 h-8 border-[5px] border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Ignite the Spark ✨</>
                        )}
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-black text-gray-400 mb-5 uppercase tracking-[0.3em]">Visual Emotion</label>
                    <div className="grid grid-cols-2 gap-5">
                        {(['passion', 'gradient', 'glass', 'dark'] as const).map((t) => (
                            <button 
                                key={t}
                                onClick={() => setProfile({...profile, theme: t})}
                                className={`py-5 px-8 rounded-3xl border-3 capitalize font-black text-lg transition-all ${
                                    profile.theme === t 
                                    ? 'bg-red-600 border-red-600 text-white shadow-2xl shadow-red-300' 
                                    : 'bg-white border-red-50 text-red-300 hover:border-red-200 hover:text-red-500'
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
      <footer className="mt-24 text-red-400 text-xs font-black uppercase tracking-[0.5em] text-center z-10 opacity-70">
        <p>&copy; 2024 Monica Oberoi</p>
        <p className="mt-5 flex items-center justify-center gap-3">
          Made with Love <span className="animate-heartbeat text-xl">💖</span> and Gemini AI
        </p>
      </footer>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-heartbeat { animation: heartbeat 3s ease-in-out infinite; }

        @keyframes float-decoration {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-120vh) rotate(720deg) translateX(50px); opacity: 0; }
        }
        .animate-float-decoration { animation: float-decoration linear infinite; }

        @keyframes burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(2.5); opacity: 0; }
        }
        .animate-burst { animation: burst 0.8s ease-out forwards; }

        @keyframes profileIn {
          from { opacity: 0; transform: translateY(50px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-profileIn { animation: profileIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes linkFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-linkFadeIn { animation: linkFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(120px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modalIn { animation: modalIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

        .border-3 { border-width: 3px; }
      `}</style>
    </div>
  );
};

export default App;
