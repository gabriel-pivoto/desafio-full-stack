/**
 * Make some properties optional on a given type.
 *
 * @example
 * type Post = { id: string; name: string; email: string };
 * Optional<Post, 'id' | 'email'> // id and email are now optional
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
