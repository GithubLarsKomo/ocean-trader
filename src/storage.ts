import type { GameState } from './domain';

export const SAVE_KEY = 'ocean-trader.save.v1';

export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

export function parseState(raw: string): GameState | null {
  try {
    const value = JSON.parse(raw) as Partial<GameState>;
    if (value.schemaVersion !== 1 || typeof value.cash !== 'number' || !value.vessel || !Array.isArray(value.contracts)) return null;
    return value as GameState;
  } catch {
    return null;
  }
}

export function loadState(storage: Pick<Storage, 'getItem'>): GameState | null {
  const raw = storage.getItem(SAVE_KEY);
  return raw ? parseState(raw) : null;
}

export function saveState(storage: Pick<Storage, 'setItem'>, state: GameState): void {
  storage.setItem(SAVE_KEY, serializeState(state));
}
