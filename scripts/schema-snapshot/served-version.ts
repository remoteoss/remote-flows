const SERVED_VERSION_HEADER = 'x-json-schema-served-version';

export function assertServedVersion(
  headers: Headers | undefined,
  country: string,
  requestedVersion: number,
) {
  const served = headers?.get(SERVED_VERSION_HEADER);
  if (served === null || served === undefined) {
    throw new Error(
      `${country} v${requestedVersion}: response has no ${SERVED_VERSION_HEADER} header, cannot confirm which version was served`,
    );
  }
  if (Number(served) !== requestedVersion) {
    throw new Error(
      `${country} v${requestedVersion}: the API served v${served} instead (the requested version is expired or unknown)`,
    );
  }
}
