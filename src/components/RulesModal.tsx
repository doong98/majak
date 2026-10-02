import React from 'react';
import { X, CheckCircle2, CornerDownRight, ArrowRight, RotateCw } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🀄</span> 사천성 (Shisen-Sho) 게임 규칙
        </h2>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 기본 목표
            </h3>
            <p className="leading-relaxed">
              보드에 놓인 모든 마작 패를 같은 모양끼리 짝을 맞춰 제거하는 퍼즐 게임입니다.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <h3 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
              <CornerDownRight className="w-4 h-4" /> 2회 꺾임 연결 조건 (핵심 룰)
            </h3>
            <p className="leading-relaxed">
              두 타일 사이의 연결선은 <strong className="text-white">빈 공간(null)</strong>만을 지나야 하며,
              직선으로 이동하다가 방향을 전환(꺾임, Turn)하는 횟수가 <strong className="text-amber-300">최대 2회 이하</strong>여야 합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-xs">
              <li><strong className="text-white">0회 꺾임 (직선):</strong> 같은 가로 또는 세로선 상에 장애물이 없음</li>
              <li><strong className="text-white">1회 꺾임 (L자):</strong> 1번 직각으로 꺾여서 도달</li>
              <li><strong className="text-white">2회 꺾임 (Z자/U자):</strong> 2번 꺾여서 도달 (보드 바깥 빈 공간 우회 가능!)</li>
            </ul>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <h3 className="font-bold text-purple-400 mb-1 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4" /> 외곽 여백 우회
            </h3>
            <p className="leading-relaxed text-xs">
              보드 가장자리의 타일들은 보드 바깥쪽의 빈 공간을 우회하여 2회 꺾임으로 맞은편 가장자리 타일과 연결될 수 있습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
};
