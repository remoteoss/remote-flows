type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E | Error;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;
