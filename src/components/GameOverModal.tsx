import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Flame, RotateCcw, Award } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isWin: boolean;
  score: number;
  timeSeconds: number;
  maxCombo: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isWin,
  score,
  timeSeconds,
  maxCombo,
  onRestart,
}) => {
  useEffect(() => {
    if (isOpen && isWin) {
      // 화려한 축하 컨페티 효과
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen, isWin]);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}분 ${secs}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden">
        {/* 상단 장식 빛 */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {isWin ? (
          <>
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Award className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">축하합니다! 스테이지 클리어!</h2>
            <p className="text-sm text-slate-300 mb-6">모든 마작 패를 성공적으로 맞추었습니다.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-400/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Clock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">게임 오버</h2>
            <p className="text-sm text-slate-300 mb-6">시간이 종료되었습니다.</p>
          </>
        )}

        {/* 결과 요약 카드 */}
        <div className="bg-slate-800/80 rounded-xl p-4 mb-6 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-400" /> 최종 점수
            </span>
            <span className="font-bold text-lg text-yellow-300">{score.toLocaleString()}점</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> 소요 시간
            </span>
            <span className="font-semibold text-slate-200">{formatTime(timeSeconds)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" /> 최대 콤보
            </span>
            <span className="font-semibold text-orange-300">{maxCombo} COMBO</span>
          </div>
        </div>

        {/* 다시 시작 버튼 */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>새 게임 시작하기</span>
        </button>
      </div>
    </div>
  );
};
