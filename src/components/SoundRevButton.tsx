import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { Car } from '../types';

interface SoundRevButtonProps {
  car: Car;
  className?: string;
}

export const SoundRevButton: React.FC<SoundRevButtonProps> = ({ car, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rpm, setRpm] = useState(900);

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);
    soundEngine.playRev(
      car.audioSoundType,
      (currentRpm) => {
        setRpm(currentRpm);
      },
      () => {
        setIsPlaying(false);
        setRpm(900);
      }
    );
  };

  return (
    <button
      onClick={handlePlaySound}
      disabled={isPlaying}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
        isPlaying
          ? 'bg-[#e5b869] text-black shadow-md shadow-[#e5b869]/30'
          : 'bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 hover:text-white border border-white/10'
      } ${className}`}
      title={`Escuchar escape de ${car.name}`}
      aria-label={`Escuchar sonido del motor de ${car.name}`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 animate-pulse text-black" />
          <span className="font-mono text-[11px] tabular-nums font-bold">
            {rpm.toLocaleString()} RPM
          </span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#e5b869]" />
          <span>Audio Motor</span>
        </>
      )}
    </button>
  );
};
