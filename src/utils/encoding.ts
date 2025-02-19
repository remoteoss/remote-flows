export function stringToBytes(str: string) {
  return new TextEncoder().encode(str);
}

export function bytesToBase64(u8arr: Uint8Array): string {
  return btoa(String.fromCodePoint(...u8arr));
}

export function stringToBase64(str: string) {
  return bytesToBase64(stringToBytes(str));
}
