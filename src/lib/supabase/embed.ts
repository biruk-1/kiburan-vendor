/** PostgREST returns a to-one embed as an object, but typings sometimes widen it to an array. */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
