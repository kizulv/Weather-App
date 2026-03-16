import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Làm tròn giá trị thời tiết đến hàng đơn vị
 */
export function formatWeatherValue(value: number | string): string | number {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  return value;
}
