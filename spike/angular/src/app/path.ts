export type Path = readonly (string | number)[];

export function getIn(source: unknown, path: Path): unknown {
  return path.reduce<unknown>(
    (current, key) =>
      current !== null && typeof current === 'object'
        ? (current as Record<string | number, unknown>)[key]
        : undefined,
    source,
  );
}

export function setIn<T>(source: T, path: Path, value: unknown): T {
  if (path.length === 0) {
    return value as T;
  }
  const [key, ...rest] = path;
  const copy = (
    Array.isArray(source) ? [...source] : { ...(source as object) }
  ) as Record<string | number, unknown>;
  copy[key] = setIn(
    copy[key] ?? (typeof rest[0] === 'number' ? [] : {}),
    rest,
    value,
  );
  return copy as T;
}
