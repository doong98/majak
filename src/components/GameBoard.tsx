import React, { useRef, useEffect, useState } from 'react';
import { Grid, Point } from '../engine/types';
import { MahjongTile } from './MahjongTile';
import { PathOverlay } from './PathOverlay';

interface GameBoardProps {
  grid: Grid;
  selectedPoint: Point | null;
  hintPoints: [Point, Point] | null;
  hintPath: Point[] | null;
  activePath: Point[] | null;
  shakingPoints: Point[];
  clearingPoints: Point[];
  onTileClick: (p: Point) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  selectedPoint,
  hintPoints,
  hintPath,
  activePath,
  shakingPoints,
  clearingPoints,
  onTileClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ cellWidth: 0, cellHeight: 0 });

  const totalRows = grid.length;
  const totalCols = grid[0]?.length || 0;

  // 창 크기 변경 또는 그리드 변경 시 각 셀의 실제 렌더링 픽셀 크기 측정
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (totalCols > 0 && totalRows > 0) {
          setDimensions({
            cellWidth: width / totalCols,
            cellHeight: height / totalRows,
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const timer = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [totalCols, totalRows, grid]);

  const isPointInList = (list: Point[], p: Point) => {
    return list.some(item => item.x === p.x && item.y === p.y);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-3 overflow-hidden">
      {/* 마작 보드 매트 (원목 테두리 & 전통 녹색 펠트 느낌) */}
      <div className="relative bg-[#1e4432] p-2 sm:p-4 rounded-2xl shadow-2xl border-4 sm:border-6 border-[#3d2817] ring-2 ring-amber-600/40 max-h-[72vh] max-w-5xl w-full flex items-center justify-center overflow-hidden">
        {/* 보드 질감 오버레이 */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 80%)'
          }}
        />

        {/* 연결선 및 타일 렌더링 컨테이너 */}
        <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-2">
          <div
            ref={containerRef}
            className="grid gap-1.5 sm:gap-2 relative select-none w-full max-w-2xl"
            style={{
              gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
            }}
          >
            {/* 활성 매칭 성공 선 오버레이 */}
            {activePath && (
              <PathOverlay
                path={activePath}
                cellWidth={dimensions.cellWidth}
                cellHeight={dimensions.cellHeight}
                isHint={false}
              />
            )}

            {/* 힌트 점선 오버레이 */}
            {hintPath && !activePath && (
              <PathOverlay
                path={hintPath}
                cellWidth={dimensions.cellWidth}
                cellHeight={dimensions.cellHeight}
                isHint={true}
              />
            )}

            {/* 그리드 셀들 렌더링 (외곽 패딩 포함) */}
            {grid.map((row, y) =>
              row.map((tile, x) => {
                const point: Point = { x, y };
                const isSelected = selectedPoint?.x === x && selectedPoint?.y === y;
                const isHint =
                  !!hintPoints &&
                  ((hintPoints[0].x === x && hintPoints[0].y === y) ||
                    (hintPoints[1].x === x && hintPoints[1].y === y));
                const isShaking = isPointInList(shakingPoints, point);
                const isClearing = isPointInList(clearingPoints, point);

                const isPaddingCell =
                  x === 0 || x === totalCols - 1 || y === 0 || y === totalRows - 1;

                // 외곽 패딩 셀은 빈 공간(연결선 경로 투과용)
                if (isPaddingCell) {
                  return (
                    <div
                      key={`padding-${x}-${y}`}
                      className="w-full aspect-[4/5] pointer-events-none opacity-0"
                    />
                  );
                }

                return (
                  <div key={`cell-${x}-${y}`} className="relative w-full aspect-[4/5] flex items-center justify-center">
                    <MahjongTile
                      tile={tile}
                      isSelected={isSelected}
                      isHint={isHint}
                      isShaking={isShaking}
                      isClearing={isClearing}
                      onClick={() => onTileClick(point)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
