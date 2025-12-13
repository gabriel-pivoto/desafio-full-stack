import { describe, expect, it } from 'vitest';
import { UniqueEntityID } from './unique-entity-id';

describe('UniqueEntityID', () => {
  it('generates a uuid when none is provided', () => {
    const id = new UniqueEntityID();

    expect(id.toString()).toHaveLength(36);
  });

  it('preserves provided value and compares equality', () => {
    const id = new UniqueEntityID('fixed-id');
    const same = new UniqueEntityID('fixed-id');
    const other = new UniqueEntityID('other-id');

    expect(id.toValue()).toBe('fixed-id');
    expect(id.equals(same)).toBe(true);
    expect(id.equals(other)).toBe(false);
  });
});
