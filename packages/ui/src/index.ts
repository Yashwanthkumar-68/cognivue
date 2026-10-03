import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const COLORS = {
  background: '#090D16',
  surface50: '#1E293B',
  surface100: '#161F30',
  surface200: '#111827',
  surface300: '#0D131F',
  cyan: '#00F0FF',
  violet: '#A855F7',
  amber: '#F59E0B',
  emerald: '#10B981',
  rose: '#F43F5E'
} as const;
