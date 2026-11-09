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
