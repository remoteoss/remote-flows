import equal from 'fast-deep-equal';

export const isDeepEqual = (a: unknown, b: unknown) => equal(a, b);
