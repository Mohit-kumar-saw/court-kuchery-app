/**
 * Utility helpers
 * Add formatters, validators, etc. here
 */

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
}
