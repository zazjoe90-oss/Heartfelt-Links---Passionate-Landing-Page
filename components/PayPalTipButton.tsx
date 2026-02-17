
import React, { useState } from 'react';

interface PayPalTipButtonProps {
  paypalUsername: string;
}

const PayPalTipButton: React.FC<PayPalTipButtonProps> = ({ paypalUsername }) => {
  const [amount, setAmount] = useState<string>('10');
  
  const handleTip = () => {
    window.open(`https://www.paypal.com/paypalme/${paypalUsername}/${amount}`, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-8 bg-white/90 backdrop-blur rounded-[2rem] shadow-2xl border border-red-100 flex flex-col items-center gap-6 transition-all hover:scale-[1.01]">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-3xl animate-bounce">💖</span>
        <h3 className="font-extrabold text-2xl text-red-600">Share the Love</h3>
        <p className="text-sm text-gray-500">Your support helps me keep creating!</p>
      </div>
      
      <div className="flex flex-wrap gap-3 w-full justify-center">
        {['5', '10', '25', '50'].map((val) => (
          <button
            key={val}
            onClick={() => setAmount(val)}
            className={`px-5 py-3 rounded-2xl font-bold transition-all ${
              amount === val 
                ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200' 
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
            }`}
          >
            ${val}
          </button>
        ))}
        <div className="relative group">
             <span className="absolute left-3 top-3 text-red-400 font-bold">$</span>
             <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 pl-8 pr-3 py-3 bg-red-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 text-red-700 font-bold border border-red-100"
                placeholder="Other"
             />
        </div>
      </div>

      <button
        onClick={handleTip}
        className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-200 transition-all active:scale-95 group"
      >
        <span className="group-hover:scale-125 transition-transform">❤️</span>
        Send a Heartfelt Tip
      </button>
      <div className="flex items-center gap-2 opacity-60">
        <svg className="w-4 h-4 text-[#0070ba]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.067 8.478c.492.29 1.157.371 1.637.525 1.574.5 2.14 2.147 2.261 3.514.136 1.545-.182 3.204-1.127 4.398-.823 1.04-2.181 1.455-3.41 1.482H13.63l-.75 4.545h-3.636l.75-4.545H6.358l.75-4.545h3.636l.75-4.545h3.636l-.75 4.545h2.46l.75-4.545h3.636L20.443 9.4c.143-.863-.162-1.78-.857-2.315-.652-.5-1.543-.585-2.355-.316a3.636 3.636 0 0 0-.164.055L20.067 8.478z"/>
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Powered by PayPal</span>
      </div>
    </div>
  );
};

export default PayPalTipButton;
