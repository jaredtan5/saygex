import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Sparkles, Swords, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import academyLandscape from "@/assets/anime-mana-academy.jpg";
import erisPortrait from "@/assets/bot-eris.jpg";
import nanahoshiPortrait from "@/assets/bot-nanahoshi.jpg";
import roxyPortrait from "@/assets/bot-roxy.jpg";
import rudeusPortrait from "@/assets/bot-rudeus.jpg";
import sylphiePortrait from "@/assets/bot-sylphie.jpg";
import erisAsset from "@/assets/eris-upload.webp.asset.json";
import nanahoshiAsset from "@/assets/nanahoshi-upload.webp.asset.json";
import roxyAsset from "@/assets/roxy-upload.webp.asset.json";
import rudeusAsset from "@/assets/rudeus-upload.webp.asset.json";
import sylphieAsset from "@/assets/sylphie-upload.webp.asset.json";
import { Button } from "@/components/ui/button";
import {
  type Cell,
  COLUMNS,
  type Player,
  type Position,
  ROWS,
  chooseBotColumn,
  createBoard,
  dropStone,
  findWinningCells,
  isBoardFull,
} from "@/lib/connect-four";
import { cn } from "@/lib/utils";

type Opponent = {
  id: string;
  name: string;
  difficulty: string;
  level: number;
  tagline: string;
  portrait: string;
  fullBody: string;
};

const OPPONENTS: Opponent[] = [
  {
    id: "sylphie",
    name: "Sylphie",
    difficulty: "Novice",
    level: 1,
    tagline: "Gentle wind magic, kind-hearted play",
    portrait: sylphiePortrait,
    fullBody: sylphieAsset.url,
  },
  {
    id: "eris",
    name: "Eris",
    difficulty: "Apprentice",
    level: 2,
    tagline: "Reckless, aggressive and fearless",
    portrait: erisPortrait,
    fullBody: erisAsset.url,
  },
  {
    id: "roxy",
    name: "Roxy",
    difficulty: "Adept",
    level: 3,
    tagline: "A teacher's patient, precise pressure",
    portrait: roxyPortrait,
    fullBody: roxyAsset.url,
  },
  {
    id: "nanahoshi",
    name: "Nanahoshi",
    difficulty: "Expert",
    level: 4,
    tagline: "Cold calculation, several steps ahead",
    portrait: nanahoshiPortrait,
    fullBody: nanahoshiAsset.url,
  },
  {
    id: "rudeus",
    name: "Rudeus",
    difficulty: "Master",
    level: 5,
    tagline: "Relentless foresight — few escape him",
    portrait: rudeusPortrait,
    fullBody: rudeusAsset.url,
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fourfold Mana — Connect Four Duels in the Academy" },
      {
        name: "description",
        content:
          "Duel rival mages in Connect Four — take on five character opponents from novice to master, or play a friend on the same device.",
      },
      { property: "og:title", content: "Fourfold Mana — Connect Four Duels" },
      {
        property: "og:description",
        content: "Pick your rival mage and align four mana stones to win the duel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConnectFourGame,
});

function ConnectFourGame() {
  const [mode, setMode] = useState<"solo" | "duo">("solo");
  const [opponent, setOpponent] = useState<Opponent>(OPPONENTS[0]!);
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<Position[]>([]);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [round, setRound] = useState(1);
  const [isThinking, setIsThinking] = useState(false);
  const turnToken = useRef(0);

  const winningSet = useMemo(
    () => new Set(winningCells.map(([row, column]) => `${row}-${column}`)),
    [winningCells],
  );

  const isBotTurn = mode === "solo" && currentPlayer === 2 && !winner && !isDraw;

  const playColumn = useCallback(
    (column: number, player: Player) => {
      setBoard((current) => {
        const nextBoard = dropStone(current, column, player);
        if (!nextBoard) return current;

        const victory = findWinningCells(nextBoard, player);
        if (victory.length > 0) {
          turnToken.current += 1;
          setWinner(player);
          setWinningCells(victory);
          setScores((score) => ({ ...score, [player]: score[player] + 1 }));
        } else if (isBoardFull(nextBoard)) {
          turnToken.current += 1;
          setIsDraw(true);
        } else {
          setCurrentPlayer(player === 1 ? 2 : 1);
        }
        return nextBoard;
      });
    },
    [],
  );

  const handleDrop = (column: number) => {
    if (winner || isDraw || isThinking || isBotTurn) return;
    playColumn(column, currentPlayer);
  };

  useEffect(() => {
    if (!isBotTurn) {
      setIsThinking(false);
      return;
    }
    turnToken.current += 1;
    const token = turnToken.current;
    setIsThinking(true);
    const timer = setTimeout(() => {
      if (token !== turnToken.current) return;
      const column = chooseBotColumn(board, 2, opponent.level);
      setIsThinking(false);
      if (column !== null) playColumn(column, 2);
    }, 700);
    return () => clearTimeout(timer);
  }, [isBotTurn, board, opponent.level, playColumn]);

  const clearRound = (starter: Player) => {
    turnToken.current += 1;
    setBoard(createBoard());
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsThinking(false);
    setCurrentPlayer(starter);
  };

  const beginNextRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    clearRound(nextRound % 2 === 0 ? 2 : 1);
  };

  const resetMatch = () => {
    setScores({ 1: 0, 2: 0 });
    setRound(1);
    clearRound(1);
  };

  const switchMode = (nextMode: "solo" | "duo") => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setScores({ 1: 0, 2: 0 });
    setRound(1);
    clearRound(1);
  };

  const selectOpponent = (next: Opponent) => {
    if (next.id === opponent.id && mode === "solo") return;
    setOpponent(next);
    setMode("solo");
    setScores({ 1: 0, 2: 0 });
    setRound(1);
    clearRound(1);
  };

  const rivalName = mode === "solo" ? opponent.name : "Mage 2";
  const status = winner
    ? `${winner === 1 ? "You claim" : `${rivalName} claims`} the round!`
    : isDraw
      ? "The mana field is sealed — a draw!"
      : isThinking
        ? `${opponent.name} is reading the field…`
        : mode === "solo"
          ? currentPlayer === 1
            ? "Your move — channel your mana"
            : `${opponent.name} is casting`
          : `Mage ${currentPlayer}, channel your mana`;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <img
        src={academyLandscape}
        alt="An anime-style magical academy terrace overlooking waterfalls and towers"
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

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant={mode === "solo" ? "default" : "ghost"}
              onClick={() => switchMode("solo")}
              className="font-display text-xs uppercase tracking-[0.18em] text-primary-foreground data-[active=true]:text-primary-foreground"
            >
              <Swords /> Solo duel
            </Button>
            <Button
              size="sm"
              variant={mode === "duo" ? "default" : "ghost"}
              onClick={() => switchMode("duo")}
              className="font-display text-xs uppercase tracking-[0.18em] text-primary-foreground"
            >
              <Users /> Two players
            </Button>
          </div>

          {mode === "solo" && (
            <div className="flex flex-wrap justify-center gap-2">
              {OPPONENTS.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => selectOpponent(candidate)}
                  aria-pressed={candidate.id === opponent.id}
                  className={cn("rival-chip", candidate.id === opponent.id && "rival-chip-active")}
                >
                  <img
                    src={candidate.portrait}
                    alt=""
                    width={96}
                    height={112}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span className="text-left leading-tight">
                    <span className="block font-display text-xs font-semibold text-primary-foreground">
                      {candidate.name}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-mana-light">
                      {candidate.difficulty}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-3 sm:py-5">
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <PlayerScore
              player={1}
              label={mode === "solo" ? "You" : "Mage 1"}
              score={scores[1]}
              active={!winner && !isDraw && currentPlayer === 1}
            />
            <div className="text-center text-primary-foreground">
              <Swords className="mx-auto mb-1 h-5 w-5 text-gold" />
              <span className="font-display text-xs uppercase tracking-[0.2em]">Round {round}</span>
            </div>
            <PlayerScore
              player={2}
              label={mode === "solo" ? `${opponent.name} · ${opponent.difficulty}` : "Mage 2"}
              score={scores[2]}
              active={!winner && !isDraw && currentPlayer === 2}
              portrait={mode === "solo" ? opponent.portrait : undefined}
            />
          </div>

          {mode === "solo" && (
            <p className="mb-2 text-center text-xs text-primary-foreground/75">{opponent.tagline}</p>
          )}

          <div className="mb-3 flex min-h-12 items-center justify-center text-center">
            <div className={cn("status-ribbon", (winner || isDraw) && "status-ribbon-victory")}>
              <Sparkles className="h-4 w-4 text-gold" />
              <p className="font-display text-sm font-semibold sm:text-base" aria-live="polite">
                {status}
              </p>
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-5xl items-stretch justify-center gap-4 sm:gap-8">
            {mode === "solo" && (
              <figure className="relative hidden h-full flex-none flex-col md:order-2 md:flex">
                <img
                  src={opponent.fullBody}
                  alt={`${opponent.name}, your ${opponent.difficulty} rival mage`}
                  width={640}
                  height={1024}
                  loading="lazy"
                  className={cn(
                    "rival-figure h-full w-auto flex-1 object-contain transition-opacity duration-500",
                    isThinking && "rival-figure-thinking",
                  )}
                />
                <figcaption className="pointer-events-none w-max self-center rounded-full border border-panel-border bg-panel/80 px-3 py-1 font-display text-[10px] uppercase tracking-[0.2em] text-mana-light">
                  {opponent.name} · {opponent.difficulty}
                </figcaption>
              </figure>
            )}
            <div className="flex w-full max-w-[640px] flex-col">
            <div className="mb-1 grid grid-cols-7 gap-1 px-3 sm:px-4">
              {Array.from({ length: COLUMNS }, (_, column) => (
                <button
                  key={column}
                  type="button"
                  onClick={() => handleDrop(column)}
                  disabled={
                    Boolean(winner) || isDraw || isBotTurn || board[0]?.[column] !== null
                  }
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
          {ROWS * COLUMNS} slots, one goal — align four mana stones to win the duel
        </footer>
      </div>
    </main>
  );
}

function PlayerScore({
  player,
  label,
  score,
  active,
  portrait,
}: {
  player: Player;
  label: string;
  score: number;
  active: boolean;
  portrait?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "score-plaque",
        active && "score-plaque-active",
        player === 2 && "flex-row-reverse text-right",
      )}
    >
      {portrait ? (
        <img
          src={portrait}
          alt=""
          width={96}
          height={112}
          className="h-9 w-9 flex-none rounded-full border-2 border-panel-border object-cover sm:h-11 sm:w-11"
        />
      ) : (
        <span className={cn("score-gem", player === 1 ? "score-gem-one" : "score-gem-two")} />
      )}
      <div className="min-w-0">
        <p className="truncate text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70 sm:text-xs">
          {label}
        </p>
        <p className="font-display text-lg font-bold leading-none text-primary-foreground sm:text-2xl">
          {score}
        </p>
      </div>
    </div>
  );
}
