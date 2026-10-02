import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Grid, Point, TileMatchOptions } from './engine/types';
import { Difficulty, DIFFICULTY_CONFIGS, generateSolvableBoard } from './engine/generator';
import { findConnectionPath } from './engine/pathFinder';
import { findHint, isDeadlock, shuffleRemaining } from './engine/helpers';
import { GameHistory } from './engine/history';
import { getRemainingTiles } from './engine/grid';
import { sound } from './utils/sound';
import { HeaderBar } from './components/HeaderBar';
import { ControlBar } from './components/ControlBar';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';

export const App: React.FC = () => {
  // 게임 설정 및 상태
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [grid, setGrid] = useState<Grid>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [activePath, setActivePath] = useState<Point[] | null>(null);
  const [hintPoints, setHintPoints] = useState<[Point, Point] | null>(null);
  const [hintPath, setHintPath] = useState<Point[] | null>(null);
  const [shakingPoints, setShakingPoints] = useState<Point[]>([]);
  const [clearingPoints, setClearingPoints] = useState<Point[]>([]);

  // 진행 수치
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [shufflesLeft, setShufflesLeft] = useState<number>(3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // 모달 상태
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 매칭 옵션
  const [matchOptions] = useState<TileMatchOptions>({
    allowFlowerCrossMatch: true,
    allowSeasonCrossMatch: true,
  });

  // 실행 취소(Undo) 히스토리
  const historyRef = useRef<GameHistory>(new GameHistory());
  const timerRef = useRef<number | null>(null);

  // 남은 타일 쌍 수 계산
  const remainingTilesCount = getRemainingTiles(grid).length;
  const remainingPairs = Math.floor(remainingTilesCount / 2);

  // 새 게임 시작
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    setIsProcessing(true);
    setSelectedPoint(null);
    setActivePath(null);
    setHintPoints(null);
    setHintPath(null);
    setShakingPoints([]);
    setClearingPoints([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeSeconds(0);
    setHintsLeft(3);
    setShufflesLeft(3);
    setIsGameOverModalOpen(false);
    historyRef.current.clear();

    const config = DIFFICULTY_CONFIGS[diff];
    const newBoard = generateSolvableBoard(config.width, config.height, matchOptions);
    setGrid(newBoard);
    setIsProcessing(false);
  }, [difficulty, matchOptions]);

  // 첫 마운트 시 게임 시작
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // 타이머 실행 (게임 진행 중일 때 1초마다 증가)
  useEffect(() => {
    if (isGameOverModalOpen || grid.length === 0 || remainingTilesCount === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOverModalOpen, grid.length, remainingTilesCount]);

  // 토스트 메시지 도우미
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 타일 클릭 핸들러
  const handleTileClick = (p: Point) => {
    if (isProcessing) return;
    const tile = grid[p.y]?.[p.x];
    if (!tile) return;

    // 힌트 상태 해제
    if (hintPoints) {
      setHintPoints(null);
      setHintPath(null);
    }

    // 1. 첫 번째 선택이 없는 경우
    if (!selectedPoint) {
      setSelectedPoint(p);
      sound.playSelect();
      return;
    }

    // 2. 이미 선택된 타일을 다시 클릭한 경우 -> 선택 해제
    if (selectedPoint.x === p.x && selectedPoint.y === p.y) {
      setSelectedPoint(null);
      return;
    }

    // 3. 두 번째 타일을 클릭한 경우 -> 경로 탐색 및 연결 검증
    const p1 = selectedPoint;
    const p2 = p;
    const t1 = grid[p1.y][p1.x]!;
    const t2 = grid[p2.y][p2.x]!;

    const path = findConnectionPath(grid, p1, p2, matchOptions);

    if (path !== null) {
      // === [매칭 성공] ===
      setIsProcessing(true);
      sound.playMatch();

      // 점수 계산 (기본 100점 + 콤보 보너스)
      const nextCombo = combo + 1;
      const pointsEarned = 100 + nextCombo * 50;
      setScore(prev => prev + pointsEarned);
      setCombo(nextCombo);
      setMaxCombo(prev => Math.max(prev, nextCombo));

      // Undo 히스토리에 현재 보드 상태 푸시
      historyRef.current.push({
        grid,
        removedP1: p1,
        removedP2: p2,
        tile1: t1,
        tile2: t2,
        score,
        combo,
      });

      // 연결선 시각화 (0.35초 노출)
      setActivePath(path);
      setClearingPoints([p1, p2]);
      setSelectedPoint(null);

      setTimeout(() => {
        // 보드에서 타일 제거
        setGrid(prevGrid => {
          const nextGrid = prevGrid.map(row => [...row]);
          nextGrid[p1.y][p1.x] = null;
          nextGrid[p2.y][p2.x] = null;

          // 남은 타일 검사
          const remaining = getRemainingTiles(nextGrid).length;
          if (remaining === 0) {
            // 스테이지 클리어!
            setIsWin(true);
            setIsGameOverModalOpen(true);
            sound.playWin();
          } else {
            // 교착 상태(Deadlock) 검사
            if (isDeadlock(nextGrid, matchOptions)) {
              showToast('교착 상태 감지! 타일을 자동으로 재배치합니다.');
              const shuffleRes = shuffleRemaining(nextGrid, matchOptions);
              sound.playShuffle();
              return shuffleRes.grid;
            }
          }

          return nextGrid;
        });

        setActivePath(null);
        setClearingPoints([]);
        setIsProcessing(false);
      }, 350);
    } else {
      // === [매칭 실패] ===
      sound.playMismatch();
      setCombo(0); // 콤보 리셋
      setShakingPoints([p1, p2]);
      setSelectedPoint(null);

      setTimeout(() => {
        setShakingPoints([]);
      }, 400);
    }
  };

  // 힌트 사용
  const handleHint = () => {
    if (hintsLeft <= 0 || isProcessing) return;

    const hint = findHint(grid, matchOptions);
    if (hint) {
      setHintsLeft(prev => prev - 1);
      setHintPoints([hint.p1, hint.p2]);
      setHintPath(hint.path);
      sound.playSelect();

      // 2초 후 힌트 표시 해제
      setTimeout(() => {
        setHintPoints(null);
        setHintPath(null);
      }, 2000);
    } else {
      showToast('현재 연결 가능한 타일이 없습니다. 재셔플을 사용하세요!');
    }
  };

  // 재셔플 사용
  const handleShuffle = () => {
    if (shufflesLeft <= 0 || isProcessing) return;

    setIsProcessing(true);
    setSelectedPoint(null);
    setHintPoints(null);
    setHintPath(null);

    const result = shuffleRemaining(grid, matchOptions);
    setGrid(result.grid);
    setShufflesLeft(prev => prev - 1);
    sound.playShuffle();
    showToast('타일이 재배치되었습니다!');

    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  // 되돌리기(Undo) 사용
  const handleUndo = () => {
    if (!historyRef.current.canUndo() || isProcessing) return;

    const restored = historyRef.current.undo(grid, score, combo);
    if (restored) {
      setGrid(restored.grid);
      setScore(restored.score);
      setCombo(restored.combo);
      setSelectedPoint(null);
      setHintPoints(null);
      setHintPath(null);
      showToast('이전 수로 되돌렸습니다.');
    }
  };

  // 난이도 변경
  const handleDifficultyChange = (diff: Difficulty) => {
    if (diff === difficulty) return;
    setDifficulty(diff);
    startNewGame(diff);
  };

  // 사운드 토글
  const handleToggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    sound.enabled = nextVal;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col justify-between text-slate-100 select-none">
      {/* 상단 바 헤더 */}
      <HeaderBar
        remainingPairs={remainingPairs}
        timeSeconds={timeSeconds}
        score={score}
        combo={combo}
        difficulty={difficulty}
        isSoundEnabled={isSoundEnabled}
        onDifficultyChange={handleDifficultyChange}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setIsRulesModalOpen(true)}
      />

      {/* 중앙 메인 영역 (보드) */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative">
        {/* 알림 토스트 */}
        {toastMessage && (
          <div className="absolute top-2 z-40 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg border border-amber-300 animate-bounce">
            {toastMessage}
          </div>
        )}

        {grid.length > 0 && (
          <GameBoard
            grid={grid}
            selectedPoint={selectedPoint}
            hintPoints={hintPoints}
            hintPath={hintPath}
            activePath={activePath}
            shakingPoints={shakingPoints}
            clearingPoints={clearingPoints}
            onTileClick={handleTileClick}
          />
        )}
      </main>

      {/* 하단 컨트롤 바 */}
      <ControlBar
        hintsLeft={hintsLeft}
        shufflesLeft={shufflesLeft}
        canUndo={historyRef.current.canUndo()}
        onHint={handleHint}
        onShuffle={handleShuffle}
        onUndo={handleUndo}
        onRestart={() => startNewGame()}
        isProcessing={isProcessing}
      />

      {/* 게임 결과 모달 */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        isWin={isWin}
        score={score}
        timeSeconds={timeSeconds}
        maxCombo={maxCombo}
        onRestart={() => startNewGame()}
      />

      {/* 게임 룰 가이드 모달 */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};

export default App;
