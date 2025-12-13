import { describe, expect, it } from 'vitest';
import { left, right, Left, Right } from './either';

describe('Either helpers', () => {
  it('creates left values and type guards', () => {
    const value = left('error');

    expect(value).toBeInstanceOf(Left);
    expect(value.isLeft()).toBe(true);
    expect(value.isRight()).toBe(false);
    expect(value.value).toBe('error');
  });

  it('creates right values and type guards', () => {
    const value = right(42);

    expect(value).toBeInstanceOf(Right);
    expect(value.isRight()).toBe(true);
    expect(value.isLeft()).toBe(false);
    expect(value.value).toBe(42);
  });
});
