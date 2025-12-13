import { describe, expect, it } from 'vitest';
import { UniqueEntityID } from './unique-entity-id';
import { Entity } from './entity';

class DummyEntity extends Entity<{ value: string }> {
  constructor(props: { value: string }, id?: UniqueEntityID) {
    super(props, id);
  }
}

describe('Entity', () => {
  it('compares equal when same reference', () => {
    const entity = new DummyEntity({ value: 'a' });

    expect(entity.equals(entity)).toBe(true);
  });

  it('compares equal when IDs match', () => {
    const id = new UniqueEntityID('fixed-id');
    const entityA = new DummyEntity({ value: 'a' }, id);
    const entityB = new DummyEntity({ value: 'b' }, id);

    expect(entityA.equals(entityB)).toBe(true);
  });

  it('compares different when IDs differ', () => {
    const entityA = new DummyEntity({ value: 'a' }, new UniqueEntityID('one'));
    const entityB = new DummyEntity({ value: 'b' }, new UniqueEntityID('two'));

    expect(entityA.equals(entityB)).toBe(false);
  });
});
