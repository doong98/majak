import { Tile, TileCategory, TileMatchOptions } from './types';

export interface TileTemplate {
  category: TileCategory;
  value: number | string;
  name: string;
  symbol: string;
  color: string;
  subText?: string;
}

export const TILE_TEMPLATES: TileTemplate[] = [
  // 1. 만수패 (Characters / Wan) 1~9
  { category: 'wan', value: 1, name: '1만', symbol: '一萬', color: '#dc2626', subText: '一' },
  { category: 'wan', value: 2, name: '2만', symbol: '二萬', color: '#dc2626', subText: '二' },
  { category: 'wan', value: 3, name: '3만', symbol: '三萬', color: '#dc2626', subText: '三' },
  { category: 'wan', value: 4, name: '4만', symbol: '四萬', color: '#dc2626', subText: '四' },
  { category: 'wan', value: 5, name: '5만', symbol: '五萬', color: '#dc2626', subText: '五' },
  { category: 'wan', value: 6, name: '6만', symbol: '六萬', color: '#dc2626', subText: '六' },
  { category: 'wan', value: 7, name: '7만', symbol: '七萬', color: '#dc2626', subText: '七' },
  { category: 'wan', value: 8, name: '8만', symbol: '八萬', color: '#dc2626', subText: '八' },
  { category: 'wan', value: 9, name: '9만', symbol: '九萬', color: '#dc2626', subText: '九' },

  // 2. 통수패 (Dots / Tong) 1~9
  { category: 'tong', value: 1, name: '1통', symbol: '①', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 2, name: '2통', symbol: '②', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 3, name: '3통', symbol: '③', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 4, name: '4통', symbol: '④', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 5, name: '5통', symbol: '⑤', color: '#dc2626', subText: '筒' },
  { category: 'tong', value: 6, name: '6통', symbol: '⑥', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 7, name: '7통', symbol: '⑦', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 8, name: '8통', symbol: '⑧', color: '#2563eb', subText: '筒' },
  { category: 'tong', value: 9, name: '9통', symbol: '⑨', color: '#2563eb', subText: '筒' },

  // 3. 삭수패 (Bamboo / Sak) 1~9
  { category: 'sak', value: 1, name: '1삭', symbol: '鳥', color: '#16a34a', subText: '索' }, // 1삭은 전통적으로 공작/참새
  { category: 'sak', value: 2, name: '2삭', symbol: '2竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 3, name: '3삭', symbol: '3竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 4, name: '4삭', symbol: '4竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 5, name: '5삭', symbol: '5竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 6, name: '6삭', symbol: '6竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 7, name: '7삭', symbol: '7竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 8, name: '8삭', symbol: '8竹', color: '#16a34a', subText: '索' },
  { category: 'sak', value: 9, name: '9삭', symbol: '9竹', color: '#16a34a', subText: '索' },

  // 4. 자패 - 사풍패 (Winds)
  { category: 'wind', value: 'east', name: '동풍', symbol: '東', color: '#1e293b', subText: '風' },
  { category: 'wind', value: 'south', name: '남풍', symbol: '南', color: '#1e293b', subText: '風' },
  { category: 'wind', value: 'west', name: '서풍', symbol: '西', color: '#1e293b', subText: '風' },
  { category: 'wind', value: 'north', name: '북풍', symbol: '北', color: '#1e293b', subText: '風' },

  // 5. 자패 - 삼원패 (Dragons)
  { category: 'dragon', value: 'white', name: '백판', symbol: '白', color: '#3b82f6', subText: '元' },
  { category: 'dragon', value: 'green', name: '발재', symbol: '發', color: '#16a34a', subText: '元' },
  { category: 'dragon', value: 'red', name: '중', symbol: '中', color: '#dc2626', subText: '元' },

  // 6. 꽃패 (Flowers)
  { category: 'flower', value: 'plum', name: '매화', symbol: '梅', color: '#ec4899', subText: '花' },
  { category: 'flower', value: 'orchid', name: '난초', symbol: '蘭', color: '#a855f7', subText: '花' },
  { category: 'flower', value: 'chrysanthemum', name: '국화', symbol: '菊', color: '#f59e0b', subText: '花' },
  { category: 'flower', value: 'bamboo_flower', name: '대나무', symbol: '竹', color: '#10b981', subText: '花' },

  // 7. 계절패 (Seasons)
  { category: 'season', value: 'spring', name: '봄', symbol: '春', color: '#10b981', subText: '季' },
  { category: 'season', value: 'summer', name: '여름', symbol: '夏', color: '#ef4444', subText: '季' },
  { category: 'season', value: 'autumn', name: '가을', symbol: '秋', color: '#f97316', subText: '季' },
  { category: 'season', value: 'winter', name: '겨울', symbol: '冬', color: '#06b6d4', subText: '季' },
];

/**
 * 두 타일이 서로 일치하는지 판별하는 함수
 */
export function isTileMatch(
  t1: Tile | null,
  t2: Tile | null,
  options: TileMatchOptions = {}
): boolean {
  if (!t1 || !t2) return false;
  if (t1.id === t2.id) return false; // 자기 자신과는 매칭 불가

  const {
    allowFlowerCrossMatch = false,
    allowSeasonCrossMatch = false
  } = options;

  // 꽃패 상호 매칭 허용 옵션
  if (allowFlowerCrossMatch && t1.category === 'flower' && t2.category === 'flower') {
    return true;
  }

  // 계절패 상호 매칭 허용 옵션
  if (allowSeasonCrossMatch && t1.category === 'season' && t2.category === 'season') {
    return true;
  }

  // 기본적으로 카테고리와 값이 완전히 일치해야 함
  return t1.category === t2.category && t1.value === t2.value;
}

let tileIdCounter = 0;
export function createTileFromTemplate(template: TileTemplate, suffix = ''): Tile {
  tileIdCounter++;
  return {
    id: `tile-${template.category}-${template.value}-${tileIdCounter}-${suffix}`,
    category: template.category,
    value: template.value,
    name: template.name,
    symbol: template.symbol,
    color: template.color
  };
}
