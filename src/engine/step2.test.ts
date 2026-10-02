import { describe, it, expect } from 'vitest';
import { generateSolvableBoard } from './generator';
import { getAvailableMoves, findHint, isDeadlock, shuffleRemaining } from './helpers';
import { GameHistory } from './history';
import { createEmptyGrid, getRemainingTiles } from './grid';
import { createTileFromTemplate, TILE_TEMPLATES } from './tiles';
import { Point } from './types';

describe('2단계: 클리어 보장 맵 생성기 및 게임 헬퍼 단위 테스트', () => {
  const wan1Template = TILE_TEMPLATES.find(t => t.category === 'wan' && t.value === 1)!;
  const wan2Template = TILE_TEMPLATES.find(t => t.category === 'wan' && t.value === 2)!;

  it('1. 클리어 보장 맵 생성: 올바른 타일 개수와 초기 유효 무브 보장', () => {
    const width = 6;
    const height = 4;
    const board = generateSolvableBoard(width, height);

    // 총 그리드 크기 검사 (확장 패딩 포함: (6+2) x (4+2) = 8 x 6)
    expect(board.length).toBe(6);
    expect(board[0].length).toBe(8);

    // 외곽 패딩(x=0, x=7, y=0, y=5)은 모두 null이어야 함
    for (let x = 0; x < 8; x++) {
      expect(board[0][x]).toBeNull();
      expect(board[5][x]).toBeNull();
    }
    for (let y = 0; y < 6; y++) {
      expect(board[y][0]).toBeNull();
      expect(board[y][7]).toBeNull();
    }

    // 내부 셀은 총 24개이고 모두 타일이 채워져 있어야 함
    const remaining = getRemainingTiles(board);
    expect(remaining.length).toBe(24);

    // 초기 상태에서 즉시 제거 가능한 무브가 최소 1개 이상 존재해야 함
    const moves = getAvailableMoves(board);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('2. 힌트(Hint) 시스템: 유효 매칭이 있을 때 첫 번째 유효 경로 반환', () => {
    const grid = createEmptyGrid(4, 2);
    // (1, 1)과 (4, 1)에 같은 타일 배치 (0회 꺾임 직선 경로)
    const t1 = createTileFromTemplate(wan1Template);
    const t2 = createTileFromTemplate(wan1Template);
    grid[1][1] = t1;
    grid[1][4] = t2;

    const hint = findHint(grid);
    expect(hint).not.toBeNull();
    expect(hint?.p1).toEqual({ x: 1, y: 1 });
    expect(hint?.p2).toEqual({ x: 4, y: 1 });
    expect(hint?.path.length).toBeGreaterThan(0);
  });

  it('3. 교착 상태(Deadlock) 감지: 남은 타일이 있지만 유효 경로가 없을 때 올바르게 감지', () => {
    const grid = createEmptyGrid(4, 2);
    // 두 쌍을 서로 엇갈리게 장애물 형태로 가둠
    // 예: 타일이 서로 다른 종류이거나 사방이 막혀서 연결 불가
    const t1 = createTileFromTemplate(wan1Template);
    const t2 = createTileFromTemplate(wan2Template);
    // 하나씩만 남아서 서로 매칭되지 않는 경우
    grid[1][1] = t1;
    grid[1][2] = t2;

    expect(isDeadlock(grid)).toBe(true);
  });

  it('4. 교착 상태 해소 및 재셔플(Shuffle): 셔플 후 유효 무브가 다시 생성됨', () => {
    const grid = createEmptyGrid(4, 2);
    // 같은 타일 2장씩 총 4장 배치
    const t1a = createTileFromTemplate(wan1Template);
    const t1b = createTileFromTemplate(wan1Template);
    const t2a = createTileFromTemplate(wan2Template);
    const t2b = createTileFromTemplate(wan2Template);

    grid[1][1] = t1a;
    grid[1][2] = t2a;
    grid[1][3] = t1b;
    grid[1][4] = t2b;

    // shuffleRemaining 호출
    const result = shuffleRemaining(grid);
    expect(result.success).toBe(true);
    
    // 셔플된 보드에서 유효 무브가 존재하는지 검증
    const moves = getAvailableMoves(result.grid);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('5. 실행 취소(Undo) 히스토리 스택: 상태 저장 및 정확한 복원', () => {
    const history = new GameHistory();
    const grid = createEmptyGrid(4, 2);
    const t1 = createTileFromTemplate(wan1Template);
    const t2 = createTileFromTemplate(wan1Template);
    const p1: Point = { x: 1, y: 1 };
    const p2: Point = { x: 2, y: 1 };
    grid[p1.y][p1.x] = t1;
    grid[p2.y][p2.x] = t2;

    // 타일 제거 전 상태를 히스토리에 기록
    history.push({
      grid,
      removedP1: p1,
      removedP2: p2,
      tile1: t1,
      tile2: t2,
      score: 100,
      combo: 1,
    });

    // 타일 제거
    grid[p1.y][p1.x] = null;
    grid[p2.y][p2.x] = null;
    expect(grid[p1.y][p1.x]).toBeNull();

    // 실행 취소(Undo)
    expect(history.canUndo()).toBe(true);
    const restored = history.undo(grid, 200, 2);
    expect(restored).not.toBeNull();
    expect(restored!.score).toBe(100);
    expect(restored!.combo).toBe(1);
    expect(restored!.grid[p1.y][p1.x]).not.toBeNull();
    expect(restored!.grid[p2.y][p2.x]).not.toBeNull();
  });
});
