import React from 'react';
import { Point } from '../engine/types';
import { extractCornerPoints } from '../engine/pathFinder';

interface PathOverlayProps {
  path: Point[] | null;
  cellWidth: number;
  cellHeight: number;
  isHint?: boolean;
}

export const PathOverlay: React.FC<PathOverlayProps> = ({
  path,
  cellWidth,
  cellHeight,
  isHint = false,
}) => {
  if (!path || path.length < 2) return null;

  // 꺾임점(코너 및 시작/끝점) 추출
  const corners = extractCornerPoints(path);

  // 셀 중심점 좌표로 변환
  const pointsString = corners
    .map(p => `${p.x * cellWidth + cellWidth / 2},${p.y * cellHeight + cellHeight / 2}`)
    .join(' ');

  const strokeColor = isHint ? '#38bdf8' : '#fbbf24'; // 힌트: 하늘색, 매칭: 골드
  const glowColor = isHint ? 'rgba(56, 189, 248, 0.6)' : 'rgba(251, 191, 36, 0.7)';

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      style={{ filter: `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor})` }}
    >
      {/* 두꺼운 외부 글로우 라인 */}
      <polyline
        points={pointsString}
        fill="none"
        stroke={strokeColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* 내부 주 광선 라인 */}
      <polyline
        points={pointsString}
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isHint ? '8 6' : undefined}
        className={isHint ? 'animate-pulse' : undefined}
      />

      {/* 코너 및 시작/끝점 하이라이트 원 */}
      {corners.map((p, idx) => (
        <circle
          key={`dot-${idx}-${p.x}-${p.y}`}
          cx={p.x * cellWidth + cellWidth / 2}
          cy={p.y * cellHeight + cellHeight / 2}
          r="6"
          fill="#ffffff"
          stroke={strokeColor}
          strokeWidth="3"
        />
      ))}
    </svg>
  );
};
