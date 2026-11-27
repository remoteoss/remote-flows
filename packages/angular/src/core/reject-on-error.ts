export function rejectOnError<
  T extends { error?: unknown; response?: Response },
>(queryFn: () => Promise<T>) {
  return async () => {
    const result = await queryFn();
    if (result.error) {
      throw new Error(
        `Request failed with status ${result.response?.status ?? 'unknown'}`,
      );
    }
    return result;
  };
}
