import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Sparkles, Swords } from "lucide-react";
import { useMemo, useState } from "react";

import academyLandscape from "@/assets/mana-academy.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Player = 1 | 2;
type Cell = Player | null;
type Position = [number, number];

const ROWS = 6;
const COLUMNS = 7;
const DIRECTIONS: Position[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

const createBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLUMNS).fill(null));

function findWinningCells(board: Cell[][], player: Player): Position[] {
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      for (const [rowStep, columnStep] of DIRECTIONS) {
        const cells: Position[] = [];
        for (let distance = 0; distance < 4; distance += 1) {
          const nextRow = row + rowStep * distance;
          const nextColumn = column + columnStep * distance;
          if (board[nextRow]?.[nextColumn] !== player) break;
          cells.push([nextRow, nextColumn]);
        }
        if (cells.length === 4) return cells;
      }
    }
  }
  return [];
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fourfold Mana — A Fantasy Connect Four Duel" },
      {
        name: "description",
        content: "Challenge a friend to a magical, local two-player Connect Four duel.",
      },
      { property: "og:title", content: "Fourfold Mana — Connect Four" },
      {
        property: "og:description",
        content: "Align four mana stones and claim victory in a fantasy academy duel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConnectFourGame,
});

function ConnectFourGame() {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<Position[]>([]);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [round, setRound] = useState(1);

  const winningSet = useMemo(
    () => new Set(winningCells.map(([row, column]) => `${row}-${column}`)),
    [winningCells],
  );

  const playColumn = (column: number) => {
    if (winner || isDraw) return;
    const openRow = board.findLastIndex((row) => row[column] === null);
    if (openRow < 0) return;

    const nextBoard = board.map((row) => [...row]);
    nextBoard[openRow][column] = currentPlayer;
    const victory = findWinningCells(nextBoard, currentPlayer);
    setBoard(nextBoard);

    if (victory.length > 0) {
      setWinner(currentPlayer);
      setWinningCells(victory);
      setScores((current) => ({
        ...current,
        [currentPlayer]: current[currentPlayer] + 1,
      }));
      return;
    }

    if (nextBoard.every((row) => row.every((cell) => cell !== null))) {
      setIsDraw(true);
      return;
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const beginNextRound = () => {
    const nextRound = round + 1;
    setBoard(createBoard());
    setRound(nextRound);
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setCurrentPlayer(nextRound % 2 === 0 ? 2 : 1);
  };

  const resetMatch = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setScores({ 1: 0, 2: 0 });
    setRound(1);
  };

  const status = winner
    ? `Mage ${winner} claims the round!`
    : isDraw
      ? "The mana field is sealed — a draw!"
      : `Mage ${currentPlayer}, channel your mana`;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <img
        src={academyLandscape}
        alt="A sunlit magical academy overlooking mountains and waterfalls"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-scene-overlay" />
      <div className="mana-dust" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 text-primary-foreground">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.28em] text-mana-light">
              Ranoa Academy Trials
            </p>
            <h1 className="font-display text-2xl font-bold sm:text-4xl">Fourfold Mana</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetMatch}
            aria-label="Reset match"
            title="Reset match"
            className="border border-panel-border bg-panel/65 text-primary-foreground hover:bg-panel hover:text-primary-foreground"
          >
            <RotateCcw />
          </Button>
        </header>

        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-3 sm:py-5">
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <PlayerScore player={1} score={scores[1]} active={!winner && !isDraw && currentPlayer === 1} />
            <div className="text-center text-primary-foreground">
              <Swords className="mx-auto mb-1 h-5 w-5 text-gold" />
              <span className="font-display text-xs uppercase tracking-[0.2em]">Round {round}</span>
            </div>
            <PlayerScore player={2} score={scores[2]} active={!winner && !isDraw && currentPlayer === 2} />
          </div>

          <div className="mb-3 flex min-h-12 items-center justify-center text-center">
            <div className={cn("status-ribbon", (winner || isDraw) && "status-ribbon-victory")}>
              <Sparkles className="h-4 w-4 text-gold" />
              <p className="font-display text-sm font-semibold sm:text-base" aria-live="polite">
                {status}
              </p>
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[640px]">
            <div className="mb-1 grid grid-cols-7 gap-1 px-3 sm:px-4">
              {Array.from({ length: COLUMNS }, (_, column) => (
                <button
                  key={column}
                  type="button"
                  onClick={() => playColumn(column)}
                  disabled={Boolean(winner) || isDraw || board[0][column] !== null}
                  className="group flex h-7 items-center justify-center rounded-sm text-mana-light transition-colors hover:bg-panel/50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9"
                  aria-label={`Drop mana stone in column ${column + 1}`}
                >
                  <span className="text-base transition-transform group-hover:translate-y-1 sm:text-xl">▼</span>
                </button>
              ))}
            </div>

            <div className="game-board" role="grid" aria-label="Connect Four board">
              {board.map((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <div className="board-slot" role="gridcell" key={`${rowIndex}-${columnIndex}`}>
                    {cell && (
                      <span
                        className={cn(
                          "mana-stone",
                          cell === 1 ? "mana-stone-one" : "mana-stone-two",
                          winningSet.has(`${rowIndex}-${columnIndex}`) && "mana-stone-winning",
                        )}
                        aria-label={`Mage ${cell} mana stone`}
                      />
                    )}
                  </div>
                )),
              )}
            </div>
          </div>

          <div className="mt-4 flex min-h-10 justify-center">
            {(winner || isDraw) && (
              <Button onClick={beginNextRound} size="lg" className="font-display uppercase tracking-widest">
                <Sparkles /> Begin next round
              </Button>
            )}
          </div>
        </section>

        <footer className="text-center text-xs text-primary-foreground/75">
          First mage to align four mana stones wins the duel
        </footer>
      </div>
    </main>
  );
}

function PlayerScore({ player, score, active }: { player: Player; score: number; active: boolean }) {
  return (
    <div
      className={cn(
        "score-plaque",
        active && "score-plaque-active",
        player === 2 && "flex-row-reverse text-right",
      )}
    >
      <span className={cn("score-gem", player === 1 ? "score-gem-one" : "score-gem-two")} />
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70 sm:text-xs">
          Mage {player}
        </p>
        <p className="font-display text-lg font-bold leading-none text-primary-foreground sm:text-2xl">{score}</p>
      </div>
    </div>
  );
}