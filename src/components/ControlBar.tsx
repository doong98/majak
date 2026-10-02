import React from 'react';
import { Lightbulb, Shuffle, RotateCcw, RefreshCw } from 'lucide-react';

interface ControlBarProps {
  hintsLeft: number;
  shufflesLeft: number;
  canUndo: boolean;
  onHint: () => void;
  onShuffle: () => void;
  onUndo: () => void;
  onRestart: () => void;
  isProcessing: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  hintsLeft,
  shufflesLeft,
  canUndo,
  onHint,
  onShuffle,
  onUndo,
  onRestart,
  isProcessing,
}) => {
  return (
    <footer className="w-full bg-slate-900/80 backdrop-blur border-t border-slate-800 py-3 px-4 shadow-xl">
      <div className="max-w-xl mx-auto flex items-center justify-center gap-2 sm:gap-4">
        {/* 힌트 버튼 */}
        <button
          type="button"
          onClick={onHint}
          disabled={hintsLeft <= 0 || isProcessing}
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm
            border transition-all shadow-md active:scale-95
            ${
              hintsLeft > 0 && !isProcessing
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400/50 shadow-cyan-900/30'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
            }
          `}
        >
          <Lightbulb className="w-4 h-4 text-cyan-200" />
          <span>힌트</span>
          <span className="bg-cyan-800/80 text-cyan-200 px-1.5 py-0.5 rounded-full text-[11px]">
            {hintsLeft}
          </span>
        </button>

        {/* 재셔플 버튼 */}
        <button
          type="button"
          onClick={onShuffle}
          disabled={shufflesLeft <= 0 || isProcessing}
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm
            border transition-all shadow-md active:scale-95
            ${
              shufflesLeft > 0 && !isProcessing
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/50 shadow-purple-900/30'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
            }
          `}
        >
          <Shuffle className="w-4 h-4 text-purple-200" />
          <span>재셔플</span>
          <span className="bg-purple-800/80 text-purple-200 px-1.5 py-0.5 rounded-full text-[11px]">
            {shufflesLeft}
          </span>
        </button>

        {/* 실행 취소 (Undo) 버튼 */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || isProcessing}
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm
            border transition-all shadow-md active:scale-95
            ${
              canUndo && !isProcessing
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/50 shadow-amber-900/30'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
            }
          `}
        >
          <RotateCcw className="w-4 h-4 text-amber-200" />
          <span>되돌리기</span>
        </button>

        {/* 새 게임 / 다시 시작 버튼 */}
        <button
          type="button"
          onClick={onRestart}
          disabled={isProcessing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition shadow-md active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-slate-300" />
          <span>새 게임</span>
        </button>
      </div>
    </footer>
  );
};
