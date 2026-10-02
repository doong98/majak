import { Grid, Point, AvailableMove, TileMatchOptions, Tile } from './types';
import { findConnectionPath } from './pathFinder';
import { cloneGrid, getRemainingTiles } from './grid';
import { isTileMatch } from './tiles';

/**
 * 현재 보드에서 즉시 제거 가능한 모든 타일 쌍과 경로를 탐색하여 반환합니다.
 */
export function getAvailableMoves(
  grid: Grid,
  options: TileMatchOptions = {}
): AvailableMove[] {
  const remaining = getRemainingTiles(grid);
  const moves: AvailableMove[] = [];

  // 모든 남아있는 타일 쌍 비교
  for (let i = 0; i < remaining.length; i++) {
    for (let j = i + 1; j < remaining.length; j++) {
      const a = remaining[i];
      const b = remaining[j];

      // 타일 매칭 가능 여부 선검증
      if (!isTileMatch(a.tile, b.tile, options)) {
        continue;
      }

      // 두 타일 사이의 2회 꺾임 이내 경로 탐색
      const path = findConnectionPath(grid, a.point, b.point, options);
      if (path !== null) {
        moves.push({
          p1: a.point,
          p2: b.point,
          path,
          tile: a.tile
        });
      }
    }
  }

  return moves;
}

/**
 * 힌트로 제공할 첫 번째 유효 매칭을 반환합니다.
 */
export function findHint(
  grid: Grid,
  options: TileMatchOptions = {}
): AvailableMove | null {
  const moves = getAvailableMoves(grid, options);
  return moves.length > 0 ? moves[0] : null;
}

/**
 * 현재 보드가 교착 상태(Deadlock)인지 확인합니다.
 * (남은 타일이 존재하지만 유효한 매칭 경로가 전혀 없는 경우)
 */
export function isDeadlock(grid: Grid, options: TileMatchOptions = {}): boolean {
  const remaining = getRemainingTiles(grid);
  if (remaining.length === 0) {
    return false; // 이미 클리어됨
  }
  const moves = getAvailableMoves(grid, options);
  return moves.length === 0;
}

/**
 * 보드가 완전히 해결(클리어) 가능한지 시뮬레이션하는 빠른 솔버
 */
export function canSolveBoard(grid: Grid, options: TileMatchOptions = {}): boolean {
  const simGrid = cloneGrid(grid);

  while (true) {
    const moves = getAvailableMoves(simGrid, options);
    if (moves.length === 0) {
      // 더 이상 무브가 없을 때 남은 타일이 없으면 풀이 성공
      return getRemainingTiles(simGrid).length === 0;
    }

    // 탐욕적으로 첫 번째 유효 무브를 제거
    const move = moves[0];
    simGrid[move.p1.y][move.p1.x] = null;
    simGrid[move.p2.y][move.p2.x] = null;
  }
}

/**
 * 남은 타일들의 위치만을 재배치(Shuffle)하여 최소 1개 이상의 유효 무브가 존재하는 상태로 복구합니다.
 */
export function shuffleRemaining(
  grid: Grid,
  options: TileMatchOptions = {},
  maxTries = 50
): { grid: Grid; success: boolean } {
  const remaining = getRemainingTiles(grid);
  if (remaining.length <= 1) {
    return { grid: cloneGrid(grid), success: true };
  }

  const positions = remaining.map(r => r.point);
  const tiles = remaining.map(r => r.tile);

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const newGrid = cloneGrid(grid);
    
    // Fisher-Yates 셔플로 타일 배열 무작위 섞기
    const shuffledTiles = [...tiles];
    for (let i = shuffledTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTiles[i], shuffledTiles[j]] = [shuffledTiles[j], shuffledTiles[i]];
    }

    // 원래 타일이 있던 위치들에 섞인 타일 재배치
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      newGrid[pos.y][pos.x] = shuffledTiles[i];
    }

    // 최소 1개 이상의 유효 무브가 생겼는지 확인
    const moves = getAvailableMoves(newGrid, options);
    if (moves.length > 0) {
      return { grid: newGrid, success: true };
    }
  }

  // maxTries 내에 유효 무브를 못 찾았을 경우 가장 최근 셔플 결과 반환
  return { grid: cloneGrid(grid), success: false };
}
