/** Largest-remainder rounding keeps displayed percentages at 100% (one decimal). */
export function roundedPercentages(counts: readonly number[]): number[] {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total === 0) return counts.map(() => 0);
  const exact = counts.map((count) => (count / total) * 1000);
  const rounded = exact.map(Math.floor);
  const remaining = 1000 - rounded.reduce((sum, value) => sum + value, 0);
  const order = exact.map((value, index) => ({ index, fraction: value - rounded[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remaining; index++) rounded[order[index].index]++;
  return rounded.map((value) => value / 10);
}
