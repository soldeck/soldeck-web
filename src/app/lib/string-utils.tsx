export function compareText(a: string | null, b: string | null) {
  if (a !== null && b !== null) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (b === null) return -1;
  return 1;
}
