import { Grid, Point, Tile } from './types';
import { cloneGrid } from './grid';

export interface HistoryEntry {
  grid: Grid;
  removedP1: Point;
  removedP2: Point;
  tile1: Tile;
  tile2: Tile;
  score: number;
  combo: number;
}

export class GameHistory {
  private past: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];

  constructor() {
    this.past = [];
    this.future = [];
  }

  /**
   * 새 무브 기록을 스택에 푸시합니다.
   */
  push(entry: HistoryEntry): void {
    // 깊은 복사하여 과거 상태를 안전하게 보관
    this.past.push({
      ...entry,
      grid: cloneGrid(entry.grid),
    });
    // 새로운 동작이 일어나면 future(redo) 스택은 초기화
    this.future = [];
  }

  /**
   * 실행 취소(Undo) 가능한지 여부
   */
  canUndo(): boolean {
    return this.past.length > 0;
  }

  /**
   * 실행 취소(Undo)를 수행하고 복원할 상태를 반환합니다.
   * @param currentGrid 현재 보드 상태 (미래 스택 저장을 위해 필요)
   * @param currentScore 현재 점수
   * @param currentCombo 현재 콤보
   */
  undo(currentGrid: Grid, currentScore: number, currentCombo: number): HistoryEntry | null {
    if (!this.canUndo()) return null;

    const previousEntry = this.past.pop()!;

    // 현재 상태를 future 스택에 보관 (Redo 지원)
    this.future.push({
      grid: cloneGrid(currentGrid),
      removedP1: previousEntry.removedP1,
      removedP2: previousEntry.removedP2,
      tile1: previousEntry.tile1,
      tile2: previousEntry.tile2,
      score: currentScore,
      combo: currentCombo,
    });

    return previousEntry;
  }

  /**
   * 다시 실행(Redo) 가능한지 여부
   */
  canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * 다시 실행(Redo)을 수행합니다.
   */
  redo(currentGrid: Grid, currentScore: number, currentCombo: number): HistoryEntry | null {
    if (!this.canRedo()) return null;

    const nextEntry = this.future.pop()!;
    this.past.push({
      grid: cloneGrid(currentGrid),
      removedP1: nextEntry.removedP1,
      removedP2: nextEntry.removedP2,
      tile1: nextEntry.tile1,
      tile2: nextEntry.tile2,
      score: currentScore,
      combo: currentCombo,
    });

    return nextEntry;
  }

  /**
   * 히스토리 초기화
   */
  clear(): void {
    this.past = [];
    this.future = [];
  }

  get length(): number {
    return this.past.length;
  }
}
