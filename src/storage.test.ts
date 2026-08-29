import { describe, expect, it } from 'vitest';
import { createInitialState } from './domain';
import { parseState, serializeState } from './storage';

describe('save schema v1', () => {
  it('round-trips a valid campaign', () => {
    const state = createInitialState();
    expect(parseState(serializeState(state))).toEqual(state);
  });
  it('rejects malformed or incompatible saves', () => {
    expect(parseState('{bad')).toBeNull();
    expect(parseState(JSON.stringify({ schemaVersion: 99 }))).toBeNull();
  });
});
