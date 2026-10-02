import React from 'react';
import { Difficulty, DIFFICULTY_CONFIGS } from '../engine/generator';
import { Volume2, VolumeX, HelpCircle, Trophy, Flame, Timer as TimerIcon } from 'lucide-react';

interface HeaderBarProps {
  remainingPairs: number;
  timeSeconds: number;
  score: number;
  combo: number;
  difficulty: Difficulty;
  isSoundEnabled: boolean;
  onDifficultyChange: (diff: Difficulty) => void;
  onToggleSound: () => void;
  onOpenRules: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  remainingPairs,
  timeSeconds,
  score,
  combo,
  difficulty,
  isSoundEnabled,
  onDifficultyChange,
  onToggleSound,
  onOpenRules,
}) => {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* 타이틀 및 난이도 선택 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🀄</span>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
              전통 사천성
            </h1>
            <span className="text-xs text-slate-400 hidden sm:inline-block">Shisen-Sho</span>
          </div>

          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs font-semibold">
            {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => onDifficultyChange(key)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  difficulty === key
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {key === 'easy' ? '쉬움' : key === 'normal' ? '보통' : '어려움'}
              </button>
            ))}
          </div>
        </div>

        {/* 상태 수치 (남은 쌍, 타이머, 점수, 콤보) */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          {/* 남은 쌍 */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="text-xs text-slate-400">남은 쌍</span>
            <span className="text-base font-bold text-amber-400">{remainingPairs}</span>
          </div>

          {/* 타이머 */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <TimerIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-base font-mono font-bold text-slate-200">{formatTime(timeSeconds)}</span>
          </div>

          {/* 점수 */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-base font-bold text-yellow-300">{score.toLocaleString()}</span>
          </div>

          {/* 콤보 배수 */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-rose-600 px-2.5 py-1 rounded-lg text-white font-black text-xs animate-pop shadow-md shadow-orange-500/30">
              <Flame className="w-3.5 h-3.5" />
              <span>{combo} COMBO!</span>
            </div>
          )}
        </div>

        {/* 유틸리티 버튼 (사운드, 규칙 가이드) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={isSoundEnabled ? '소리 끄기' : '소리 켜기'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="게임 방법 및 2회 꺾임 규칙"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
