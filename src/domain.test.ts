import { describe, expect, it } from 'vitest';
import { acceptContract, advanceVoyageDay, createInitialState } from './domain';

describe('VI-001 trade loop', () => {
  it('completes one deterministic voyage and settles exactly once', () => {
    let state = acceptContract(createInitialState(), 'C-HAM-RTM-001');
    const initialCash = state.cash;
    while (state.activeVoyage) state = advanceVoyageDay(state);
    expect(state.vessel.currentPort).toBe('RTM');
    expect(state.completedContracts).toEqual(['C-HAM-RTM-001']);
    expect(state.cash).toBeGreaterThan(initialCash);
    expect(state.transactionLog[0]).toContain('Reise abgeschlossen');
  });

  it('is deterministic for the same initial state and commands', () => {
    const run = () => {
      let s = acceptContract(createInitialState(), 'C-HAM-NYC-001');
      while (s.activeVoyage) s = advanceVoyageDay(s);
      return s;
    };
    expect(run()).toEqual(run());
  });
});
