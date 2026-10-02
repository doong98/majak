import { describe, it, expect, beforeEach } from 'vitest';
import { createEmptyGrid } from './grid';
import { createTileFromTemplate, TILE_TEMPLATES } from './tiles';
import { findConnectionPath, extractCornerPoints, isStraightLineClear } from './pathFinder';
import { Grid, Point, Tile } from './types';

describe('사천성 2회 꺾임 경로 탐색 엔진 단위 테스트', () => {
  let grid: Grid;
  const width = 6;
  const height = 4;
  // 확장 그리드 크기는 (6 + 2) x (4 + 2) = 8 x 6
  // 유효 내부 셀 좌표: x in [1..6], y in [1..4]
  // 외곽 패딩 셀: x in {0, 7} 또는 y in {0, 5}

  const wan1Template = TILE_TEMPLATES.find(t => t.category === 'wan' && t.value === 1)!;
  const wan2Template = TILE_TEMPLATES.find(t => t.category === 'wan' && t.value === 2)!;
  const plumTemplate = TILE_TEMPLATES.find(t => t.category === 'flower' && t.value === 'plum')!;
  const orchidTemplate = TILE_TEMPLATES.find(t => t.category === 'flower' && t.value === 'orchid')!;
  const obstacleTemplate = TILE_TEMPLATES.find(t => t.category === 'dragon' && t.value === 'red')!;

  beforeEach(() => {
    grid = createEmptyGrid(width, height);
  });

  const placeTile = (p: Point, template = wan1Template): Tile => {
    const tile = createTileFromTemplate(template);
    grid[p.y][p.x] = tile;
    return tile;
  };

  it('1. 직선 연결 (0회 꺾임): 같은 행 또는 열에서 사이에 장애물이 없을 때 연결 성공', () => {
    const p1: Point = { x: 2, y: 2 };
    const p2: Point = { x: 5, y: 2 };
    placeTile(p1);
    placeTile(p2);

    const path = findConnectionPath(grid, p1, p2);
    expect(path).not.toBeNull();
    expect(path?.length).toBe(4); // (2,2), (3,2), (4,2), (5,2)

    const corners = extractCornerPoints(path!);
    expect(corners.length).toBe(2); // 0회 꺾임이므로 시작점과 끝점 2개만 존재
    expect(corners[0]).toEqual(p1);
    expect(corners[1]).toEqual(p2);
  });

  it('2. 1회 꺾임 (L자): 직교하는 두 선분이 비어있는 모퉁이를 거쳐 연결 성공', () => {
    const p1: Point = { x: 2, y: 1 };
    const p2: Point = { x: 4, y: 3 };
    placeTile(p1);
    placeTile(p2);

    const path = findConnectionPath(grid, p1, p2);
    expect(path).not.toBeNull();

    const corners = extractCornerPoints(path!);
    expect(corners.length).toBe(3); // 시작점, 코너 1개, 끝점
    expect(corners[0]).toEqual(p1);
    expect(corners[2]).toEqual(p2);
    // 가능한 코너는 (2, 3) 또는 (4, 1)
    const validCorner = (corners[1].x === 2 && corners[1].y === 3) || (corners[1].x === 4 && corners[1].y === 1);
    expect(validCorner).toBe(true);
  });

  it('3. 2회 꺾임 (Z자 경로): 장애물을 피해 두 번 꺾여 연결 성공', () => {
    // p1 = (1, 1), p2 = (3, 3)
    // 모퉁이 (1, 3)과 (3, 1)에 장애물을 두어 L자 경로를 차단
    const p1: Point = { x: 1, y: 1 };
    const p2: Point = { x: 3, y: 3 };
    placeTile(p1);
    placeTile(p2);
    placeTile({ x: 1, y: 3 }, obstacleTemplate);
    placeTile({ x: 3, y: 1 }, obstacleTemplate);

    // 이제 (1, 2) -> (3, 2) 를 통과하는 Z자 경로가 탐색되어야 함
    const path = findConnectionPath(grid, p1, p2);
    expect(path).not.toBeNull();

    const corners = extractCornerPoints(path!);
    expect(corners.length).toBe(4); // 시작점, 코너1, 코너2, 끝점 (총 2회 꺾임)
    expect(corners[0]).toEqual(p1);
    expect(corners[3]).toEqual(p2);
  });

  it('4. 2회 꺾임 (U자 경로): 같은 방향으로 돌아 들어가는 2회 꺾임 연결 성공', () => {
    // p1 = (2, 2), p2 = (4, 2)
    // 사이에 장애물 (3, 2)을 두어 직선 차단
    // 위쪽 (y=1)을 통해 우회: (2, 2) -> (2, 1) -> (4, 1) -> (4, 2)
    const p1: Point = { x: 2, y: 2 };
    const p2: Point = { x: 4, y: 2 };
    placeTile(p1);
    placeTile(p2);
    placeTile({ x: 3, y: 2 }, obstacleTemplate); // 가운데 장애물

    const path = findConnectionPath(grid, p1, p2);
    expect(path).not.toBeNull();

    const corners = extractCornerPoints(path!);
    expect(corners.length).toBe(4); // 2회 꺾임
    expect(corners[0]).toEqual(p1);
    expect(corners[3]).toEqual(p2);
  });

  it('5. 외곽 빈 공간(패딩)을 우회하는 경로: 타일들 바깥쪽 경계(x=0 또는 y=0 등)를 통과', () => {
    // 맨 윗줄 가장자리 타일들: p1 = (1, 1), p2 = (5, 1)
    // 그 사이 (2, 1), (3, 1), (4, 1) 모두 장애물로 차단
    // 아래쪽 y=2도 장애물로 차단하여 외곽 패딩 y=0을 거쳐야만 연결 가능하도록 설정
    const p1: Point = { x: 1, y: 1 };
    const p2: Point = { x: 5, y: 1 };
    placeTile(p1);
    placeTile(p2);

    placeTile({ x: 2, y: 1 }, obstacleTemplate);
    placeTile({ x: 3, y: 1 }, obstacleTemplate);
    placeTile({ x: 4, y: 1 }, obstacleTemplate);

    placeTile({ x: 1, y: 2 }, obstacleTemplate);
    placeTile({ x: 5, y: 2 }, obstacleTemplate);

    const path = findConnectionPath(grid, p1, p2);
    expect(path).not.toBeNull();

    // 경로에 외곽 패딩(y=0) 셀이 포함되어 있어야 함
    const usesOuterPadding = path!.some(p => p.y === 0);
    expect(usesOuterPadding).toBe(true);

    const corners = extractCornerPoints(path!);
    expect(corners.length).toBe(4); // (1, 1) -> (1, 0) -> (5, 0) -> (5, 1)
    expect(corners[1]).toEqual({ x: 1, y: 0 });
    expect(corners[2]).toEqual({ x: 5, y: 0 });
  });

  it('6. 장애물로 완전히 막혀 2회 이하 꺾임으로 도달할 수 없는 경우: null 반환', () => {
    const p1: Point = { x: 3, y: 2 };
    const p2: Point = { x: 5, y: 4 };
    placeTile(p1);
    placeTile(p2);

    // p1의 사방을 장애물로 완전히 둘러쌈
    placeTile({ x: 3, y: 1 }, obstacleTemplate);
    placeTile({ x: 3, y: 3 }, obstacleTemplate);
    placeTile({ x: 2, y: 2 }, obstacleTemplate);
    placeTile({ x: 4, y: 2 }, obstacleTemplate);

    const path = findConnectionPath(grid, p1, p2);
    expect(path).toBeNull();
  });

  it('7. 서로 다른 타일인 경우 매칭 거부 (null 반환)', () => {
    const p1: Point = { x: 2, y: 2 };
    const p2: Point = { x: 4, y: 2 };
    placeTile(p1, wan1Template);
    placeTile(p2, wan2Template); // 다른 타일

    const path = findConnectionPath(grid, p1, p2);
    expect(path).toBeNull();
  });

  it('8. 꽃패 상호 매칭 옵션 테스트', () => {
    const p1: Point = { x: 2, y: 2 };
    const p2: Point = { x: 4, y: 2 };
    placeTile(p1, plumTemplate);    // 매화
    placeTile(p2, orchidTemplate);  // 난초

    // 기본값: 서로 다른 꽃패 매칭 불가
    expect(findConnectionPath(grid, p1, p2, { allowFlowerCrossMatch: false })).toBeNull();

    // 옵션 활성화: 서로 다른 꽃패라도 상호 매칭 허용
    const path = findConnectionPath(grid, p1, p2, { allowFlowerCrossMatch: true });
    expect(path).not.toBeNull();
  });
});
