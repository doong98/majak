import { Grid, Point, TileMatchOptions } from './types';
import { isTileMatch } from './tiles';
import { arePointsEqual, isInBounds, isEmpty } from './grid';

/**
 * 두 점 사이에 장애물이 없는 직선인지 확인합니다.
 * from과 to는 동일한 수평선(y 같음) 또는 수직선(x 같음)에 있어야 합니다.
 * from과 to 자신을 제외한 중간 셀들이 모두 null(빈 칸)이어야 합니다.
 */
export function isStraightLineClear(grid: Grid, from: Point, to: Point): boolean {
  if (from.x !== to.x && from.y !== to.y) {
    return false;
  }

  // 동일한 점이면 유효한 직선으로 간주 (길이 0)
  if (arePointsEqual(from, to)) {
    return true;
  }

  if (from.y === to.y) {
    // 수평 이동
    const startX = Math.min(from.x, to.x);
    const endX = Math.max(from.x, to.x);
    for (let x = startX + 1; x < endX; x++) {
      if (grid[from.y][x] !== null) {
        return false;
      }
    }
    return true;
  } else {
    // 수직 이동
    const startY = Math.min(from.y, to.y);
    const endY = Math.max(from.y, to.y);
    for (let y = startY + 1; y < endY; y++) {
      if (grid[y][from.x] !== null) {
        return false;
      }
    }
    return true;
  }
}

/**
 * 꺾임점(Key points)들 사이를 잇는 전체 보폭 점들의 목록을 생성합니다.
 * 예: [p1, corner1, p2] -> [p1, step1, ..., corner1, ..., p2]
 */
export function expandKeyPointsToFullPath(keyPoints: Point[]): Point[] {
  if (keyPoints.length <= 1) return [...keyPoints];

  const fullPath: Point[] = [keyPoints[0]];

  for (let i = 0; i < keyPoints.length - 1; i++) {
    const curr = keyPoints[i];
    const next = keyPoints[i + 1];

    if (curr.x === next.x) {
      const step = curr.y < next.y ? 1 : -1;
      let y = curr.y + step;
      while (y !== next.y) {
        fullPath.push({ x: curr.x, y });
        y += step;
      }
    } else if (curr.y === next.y) {
      const step = curr.x < next.x ? 1 : -1;
      let x = curr.x + step;
      while (x !== next.x) {
        fullPath.push({ x, y: curr.y });
        x += step;
      }
    }
    fullPath.push(next);
  }

  return fullPath;
}

/**
 * 경로의 총 맨해튼 길이 계산
 */
function getPathLength(points: Point[]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += Math.abs(points[i].x - points[i + 1].x) + Math.abs(points[i].y - points[i + 1].y);
  }
  return len;
}

/**
 * 두 점 p1, p2 사이를 최대 2회 꺾임으로 연결하는 최단 유효 경로를 찾습니다.
 * 
 * @param grid 확장 그리드 ((W+2) x (H+2))
 * @param p1 시작 좌표
 * @param p2 대상 좌표
 * @param options 타일 매칭 옵션
 * @returns 유효한 연결 경로 Point[] (연결 불가능하거나 매칭되지 않으면 null)
 */
export function findConnectionPath(
  grid: Grid,
  p1: Point,
  p2: Point,
  options: TileMatchOptions = {}
): Point[] | null {
  // 1. 기본 유효성 검사
  if (!isInBounds(grid, p1) || !isInBounds(grid, p2)) {
    return null;
  }
  if (arePointsEqual(p1, p2)) {
    return null;
  }

  const tile1 = grid[p1.y][p1.x];
  const tile2 = grid[p2.y][p2.x];

  // 두 위치 모두 타일이 존재해야 함
  if (!tile1 || !tile2) {
    return null;
  }

  // 타일 일치 여부 검증
  if (!isTileMatch(tile1, tile2, options)) {
    return null;
  }

  // ==========================================
  // [0회 꺾임 탐색] - 직선 1개
  // ==========================================
  if (p1.x === p2.x || p1.y === p2.y) {
    if (isStraightLineClear(grid, p1, p2)) {
      return expandKeyPointsToFullPath([p1, p2]);
    }
  }

  // ==========================================
  // [1회 꺾임 탐색] - L자 경로 (코너점 1개)
  // ==========================================
  const candidate1Turn: Point[][] = [];

  // 코너 후보 1: (p1.x, p2.y)
  const c1: Point = { x: p1.x, y: p2.y };
  if (isEmpty(grid, c1) && isStraightLineClear(grid, p1, c1) && isStraightLineClear(grid, c1, p2)) {
    candidate1Turn.push([p1, c1, p2]);
  }

  // 코너 후보 2: (p2.x, p1.y)
  const c2: Point = { x: p2.x, y: p1.y };
  if (isEmpty(grid, c2) && isStraightLineClear(grid, p1, c2) && isStraightLineClear(grid, c2, p2)) {
    candidate1Turn.push([p1, c2, p2]);
  }

  if (candidate1Turn.length > 0) {
    // 1회 꺾임이 가능하면 반환 (길이가 짧은 것 우선)
    candidate1Turn.sort((a, b) => getPathLength(a) - getPathLength(b));
    return expandKeyPointsToFullPath(candidate1Turn[0]);
  }

  // ==========================================
  // [2회 꺾임 탐색] - Z자, U자, 외곽 우회 (코너점 2개)
  // ==========================================
  const totalWidth = grid[0].length;
  const totalHeight = grid.length;
  const candidate2Turns: Point[][] = [];

  // 분할 방식 A: p1에서 수평으로 레이 투사 (x축 스캔)
  // p1 -> k1(x, p1.y) -> k2(x, p2.y) -> p2
  // p1의 좌우로 빈 칸인 동안 탐색
  const checkHorizontalScan = (dir: 1 | -1) => {
    for (let x = p1.x + dir; x >= 0 && x < totalWidth; x += dir) {
      const k1: Point = { x, y: p1.y };
      // k1이 비어있지 않으면 더 이상 이 방향으로 진행 불가
      if (!isEmpty(grid, k1)) break;

      const k2: Point = { x, y: p2.y };
      // k2가 비어있고, k1 -> k2 수직선이 비어있고, k2 -> p2 수평선이 비어있는지 확인
      if (isEmpty(grid, k2)) {
        if (isStraightLineClear(grid, k1, k2) && isStraightLineClear(grid, k2, p2)) {
          candidate2Turns.push([p1, k1, k2, p2]);
        }
      }
    }
  };

  checkHorizontalScan(1);  // 오른쪽으로 확장
  checkHorizontalScan(-1); // 왼쪽으로 확장

  // 분할 방식 B: p1에서 수직으로 레이 투사 (y축 스캔)
  // p1 -> k1(p1.x, y) -> k2(p2.x, y) -> p2
  // p1의 상하로 빈 칸인 동안 탐색
  const checkVerticalScan = (dir: 1 | -1) => {
    for (let y = p1.y + dir; y >= 0 && y < totalHeight; y += dir) {
      const k1: Point = { x: p1.x, y };
      // k1이 비어있지 않으면 더 이상 이 방향으로 진행 불가
      if (!isEmpty(grid, k1)) break;

      const k2: Point = { x: p2.x, y };
      // k2가 비어있고, k1 -> k2 수평선이 비어있고, k2 -> p2 수직선이 비어있는지 확인
      if (isEmpty(grid, k2)) {
        if (isStraightLineClear(grid, k1, k2) && isStraightLineClear(grid, k2, p2)) {
          candidate2Turns.push([p1, k1, k2, p2]);
        }
      }
    }
  };

  checkVerticalScan(1);  // 아래쪽으로 확장
  checkVerticalScan(-1); // 위쪽으로 확장

  if (candidate2Turns.length > 0) {
    // 2회 꺾임 중 총 이동 거리가 가장 짧은 경로 선택
    candidate2Turns.sort((a, b) => getPathLength(a) - getPathLength(b));
    return expandKeyPointsToFullPath(candidate2Turns[0]);
  }

  // 연결 가능한 경로 없음
  return null;
}

/**
 * 전체 경로(Point[])로부터 핵심 꺾임점(코너 및 시작/끝점) 목록만을 추출합니다.
 * SVG 선분 렌더링에 매우 유용합니다.
 */
export function extractCornerPoints(path: Point[]): Point[] {
  if (path.length <= 2) return path;

  const corners: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    // 진행 방향이 바뀌었으면 코너점
    if (dx1 !== dx2 || dy1 !== dy2) {
      corners.push(curr);
    }
  }

  corners.push(path[path.length - 1]);
  return corners;
}
