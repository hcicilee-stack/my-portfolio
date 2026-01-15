
import React, { useState, useRef } from 'react';

const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = "https://cdn.pixabay.com/audio/2022/05/27/audio_180873748b.mp3"; 

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log("Autoplay blocked or audio error", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[60] flex items-center gap-4 group">
      <audio ref={audioRef} src={audioUrl} loop />
      
      <button 
        onClick={toggleMusic}
        className="flex items-center gap-3 bg-stone-900/5 backdrop-blur-sm border border-stone-200/50 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-all duration-500 shadow-sm"
      >
        <div className="flex gap-[2px] items-center h-2 w-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`w-[1.5px] bg-current transition-all duration-300 ${
                isPlaying ? 'animate-music-bar' : 'h-0.5 opacity-30'
              }`}
              style={{ 
                animationDelay: `${i * 0.15}s`,
                height: isPlaying ? '100%' : '2px'
              }}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest">
          Atmosphere: {isPlaying ? 'On' : 'Off'}
        </span>
      </button>

      <div className="opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
        <span className="font-mono text-[8px] uppercase tracking-tighter">Soft Ambient Loop</span>
      </div>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 2px; }
          50% { height: 10px; }
        }
        .animate-music-bar {
          animation: music-bar 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BackgroundMusic;
