import clsx, { ClassValue } from 'clsx';

// Simple className merging utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
