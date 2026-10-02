import { Grid, Point, Tile } from './types';

/**
 * 상하좌우 1칸의 빈 패딩을 포함한 (width + 2) x (height + 2) 크기의 빈 그리드를 생성합니다.
 */
export function createEmptyGrid(width: number, height: number): Grid {
  const totalHeight = height + 2;
  const totalWidth = width + 2;
  const grid: Grid = [];

  for (let y = 0; y < totalHeight; y++) {
    const row: (Tile | null)[] = [];
    for (let x = 0; x < totalWidth; x++) {
      row.push(null);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * 그리드의 깊은 복사본을 반환합니다.
 */
export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * 주어진 점이 그리드 유효 범위 내에 있는지 확인합니다.
 */
export function isInBounds(grid: Grid, p: Point): boolean {
  return p.y >= 0 && p.y < grid.length && p.x >= 0 && p.x < grid[0].length;
}

/**
 * 특정 위치가 빈 칸(null)인지 확인합니다.
 */
export function isEmpty(grid: Grid, p: Point): boolean {
  if (!isInBounds(grid, p)) return false;
  return grid[p.y][p.x] === null;
}

/**
 * 두 좌표가 동일한지 확인합니다.
 */
export function arePointsEqual(p1: Point, p2: Point): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

/**
 * 그리드 내 남아있는 모든 타일의 좌표와 타일 객체 목록을 반환합니다.
 */
export function getRemainingTiles(grid: Grid): { point: Point; tile: Tile }[] {
  const tiles: { point: Point; tile: Tile }[] = [];
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      const tile = grid[y][x];
      if (tile !== null) {
        tiles.push({ point: { x, y }, tile });
      }
    }
  }
  return tiles;
}
