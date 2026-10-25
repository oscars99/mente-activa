/** Splits a digit string into phone-style groups of 3 and 2: "48219" → "482 19". */
export function chunkDigits(digits: string): string {
  const groups: string[] = [];
  let rest = digits;
  while (rest.length > 0) {
    const size = rest.length <= 3 ? rest.length : rest.length === 4 ? 2 : 3;
    groups.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return groups.join(' ');
}
