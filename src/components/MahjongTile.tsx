import React from 'react';
import { Tile } from '../engine/types';

interface MahjongTileProps {
  tile: Tile | null;
  isSelected: boolean;
  isHint: boolean;
  isShaking: boolean;
  isClearing: boolean;
  onClick: () => void;
  tileSize?: number;
}

export const MahjongTile: React.FC<MahjongTileProps> = ({
  tile,
  isSelected,
  isHint,
  isShaking,
  isClearing,
  onClick,
}) => {
  if (!tile) {
    return <div className="w-full h-full pointer-events-none" />;
  }

  // 타일 카테고리별 시각적 뱃지 및 색상
  const getCategoryColor = () => {
    switch (tile.category) {
      case 'wan':
        return 'text-red-600 border-red-200';
      case 'tong':
        return 'text-blue-600 border-blue-200';
      case 'sak':
        return 'text-emerald-700 border-emerald-200';
      case 'wind':
        return 'text-slate-800 border-slate-300';
      case 'dragon':
        if (tile.value === 'red') return 'text-red-600 border-red-300';
        if (tile.value === 'green') return 'text-emerald-600 border-emerald-300';
        return 'text-blue-500 border-blue-300';
      case 'flower':
        return 'text-pink-600 border-pink-200';
      case 'season':
        return 'text-amber-600 border-amber-200';
      default:
        return 'text-slate-800 border-slate-200';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isClearing}
      className={`
        relative w-full h-full rounded-md sm:rounded-lg cursor-pointer overflow-hidden
        flex flex-col items-center justify-between p-0.5 sm:p-1
        select-none transition-all duration-150
        bg-gradient-to-b from-[#fffff7] via-[#f7f5e8] to-[#e8e4cf]
        border-t-2 border-l border-r-2 border-b-3 sm:border-b-4
        border-t-white border-l-slate-200 border-r-slate-400 border-b-slate-600
        mahjong-tile
        ${isSelected ? 'selected ring-4 ring-amber-400 -translate-y-1.5 z-20' : ''}
        ${isHint ? 'hint-target ring-4 ring-cyan-400 z-10' : ''}
        ${isShaking ? 'animate-shake ring-2 ring-rose-500' : ''}
        ${isClearing ? 'scale-90 opacity-0 transition-all duration-300' : 'scale-100 opacity-100'}
        active:scale-95
      `}
      title={`${tile.name} (${tile.symbol})`}
    >
      {/* 타일 좌상단 소형 표식 */}
      <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] font-semibold px-0.5 opacity-70">
        <span className={getCategoryColor()}>{tile.name}</span>
        {tile.category === 'flower' && <span className="text-[9px] text-pink-500">🌸</span>}
        {tile.category === 'season' && <span className="text-[9px] text-amber-500">🍂</span>}
      </div>

      {/* 타일 중앙 메인 기호/한자 */}
      <div
        className={`
          flex-1 flex items-center justify-center font-bold tracking-tight
          text-lg sm:text-2xl md:text-3xl leading-none drop-shadow-sm
          ${getCategoryColor()}
        `}
        style={{ fontFamily: '"Noto Serif KR", "Batang", serif' }}
      >
        {tile.symbol}
      </div>

      {/* 타일 하단 서브 텍스트 / 카테고리 힌트 */}
      <div className="w-full text-center text-[7px] sm:text-[9px] font-medium text-slate-500 uppercase tracking-wider">
        {tile.category}
      </div>
    </button>
  );
};
