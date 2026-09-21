export type Player = 1 | 2;
export type Cell = Player | null;
export type Position = [number, number];

export const ROWS = 6;
export const COLUMNS = 7;

const DIRECTIONS: Position[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export const createBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLUMNS).fill(null));

export function findWinningCells(board: Cell[][], player: Player): Position[] {
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

export const openRowFor = (board: Cell[][], column: number): number => {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row]?.[column] === null) return row;
  }
  return -1;
};

export const legalColumns = (board: Cell[][]): number[] =>
  Array.from({ length: COLUMNS }, (_, column) => column).filter(
    (column) => board[0]?.[column] === null,
  );

export const isBoardFull = (board: Cell[][]): boolean =>
  board.every((row) => row.every((cell) => cell !== null));

export function dropStone(board: Cell[][], column: number, player: Player): Cell[][] | null {
  const row = openRowFor(board, column);
  if (row < 0) return null;
  const next = board.map((boardRow) => [...boardRow]);
  const targetRow = next[row];
  if (!targetRow) return null;
  targetRow[column] = player;
  return next;
}

const opponentOf = (player: Player): Player => (player === 1 ? 2 : 1);

function scoreWindow(window: Cell[], player: Player): number {
  const mine = window.filter((cell) => cell === player).length;
  const theirs = window.filter((cell) => cell === opponentOf(player)).length;
  if (mine > 0 && theirs > 0) return 0;
  if (mine === 4) return 10000;
  if (theirs === 4) return -10000;
  if (mine === 3) return 60;
  if (mine === 2) return 8;
  if (theirs === 3) return -80;
  if (theirs === 2) return -10;
  return 0;
}

export function evaluateBoard(board: Cell[][], player: Player): number {
  let score = 0;
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      if (board[row]?.[column] === player) score += 3 - Math.abs(column - 3);
      for (const [rowStep, columnStep] of DIRECTIONS) {
        const window: Cell[] = [];
        for (let distance = 0; distance < 4; distance += 1) {
          const nextRow = row + rowStep * distance;
          const nextColumn = column + columnStep * distance;
          const cell = board[nextRow]?.[nextColumn];
          if (cell === undefined) break;
          window.push(cell);
        }
        if (window.length === 4) score += scoreWindow(window, player);
      }
    }
  }
  return score;
}

function minimax(
  board: Cell[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  bot: Player,
): { score: number; column: number | null } {
  const human = opponentOf(bot);
  if (findWinningCells(board, bot).length > 0) return { score: 100000 + depth, column: null };
  if (findWinningCells(board, human).length > 0) return { score: -100000 - depth, column: null };
  const moves = legalColumns(board);
  if (depth === 0 || moves.length === 0) {
    return { score: evaluateBoard(board, bot), column: null };
  }

  const ordered = [...moves].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
  let bestColumn: number | null = ordered[0] ?? null;

  if (maximizing) {
    let best = -Infinity;
    for (const column of ordered) {
      const next = dropStone(board, column, bot);
      if (!next) continue;
      const { score } = minimax(next, depth - 1, alpha, beta, false, bot);
      if (score > best) {
        best = score;
        bestColumn = column;
      }
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return { score: best, column: bestColumn };
  }

  let best = Infinity;
  for (const column of ordered) {
    const next = dropStone(board, column, human);
    if (!next) continue;
    const { score } = minimax(next, depth - 1, alpha, beta, true, bot);
    if (score < best) {
      best = score;
      bestColumn = column;
    }
    beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return { score: best, column: bestColumn };
}

const findImmediate = (board: Cell[][], player: Player): number | null => {
  for (const column of legalColumns(board)) {
    const next = dropStone(board, column, player);
    if (next && findWinningCells(next, player).length > 0) return column;
  }
  return null;
};

const pickRandom = (columns: number[]): number | null =>
  columns.length === 0 ? null : (columns[Math.floor(Math.random() * columns.length)] ?? null);

/** Choose a move for the bot. `level` 1 (novice) through 5 (master). */
export function chooseBotColumn(board: Cell[][], bot: Player, level: number): number | null {
  const moves = legalColumns(board);
  if (moves.length === 0) return null;

  const win = findImmediate(board, bot);
  if (win !== null && level > 1) return win;

  const blunderChance = [0.55, 0.3, 0.12, 0.03, 0][level - 1] ?? 0;
  if (Math.random() < blunderChance) return pickRandom(moves);

  if (win !== null) return win;
  const block = findImmediate(board, opponentOf(bot));
  if (block !== null) return block;

  const depth = [1, 2, 4, 5, 7][level - 1] ?? 4;
  const { column } = minimax(board, depth, -Infinity, Infinity, true, bot);
  return column ?? pickRandom(moves);
}
