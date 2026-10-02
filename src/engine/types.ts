export type TileCategory = 'wan' | 'tong' | 'sak' | 'wind' | 'dragon' | 'flower' | 'season';

export interface Tile {
  id: string; // 고유 ID (예: 'wan-1-a', 'wan-1-b')
  category: TileCategory;
  value: number | string; // 숫자 1~9 또는 'east', 'south', 'west', 'north', 'white', 'green', 'red', 'plum', etc.
  name: string; // 한글 이름 (예: '1만', '동', '매', '봄' 등)
  symbol: string; // 표시용 한자/기호 (예: '一萬', '東', '梅', '春' 등)
  color?: string; // 주 색상 힌트
}

export interface Point {
  x: number; // 0 <= x <= W + 1 (패딩 포함)
  y: number; // 0 <= y <= H + 1 (패딩 포함)
}

export type Grid = (Tile | null)[][];

export interface TileMatchOptions {
  allowFlowerCrossMatch?: boolean; // 꽃패(매/난/국/죽) 상호 매칭 허용 여부 (기본값: true)
  allowSeasonCrossMatch?: boolean; // 계절패(봄/여름/가을/겨울) 상호 매칭 허용 여부 (기본값: true)
}

export interface BoardConfig {
  width: number;  // 실제 플레이 가능 가로 크기 (짝수)
  height: number; // 실제 플레이 가능 세로 크기 (짝수)
}

export interface AvailableMove {
  p1: Point;
  p2: Point;
  path: Point[];
  tile: Tile;
}

export interface MoveHistory {
  p1: Point;
  p2: Point;
  tile1: Tile;
  tile2: Tile;
  path: Point[];
  score: number;
  combo: number;
}
