export function generateReport(rows, options = {}) {
  const valid = [];
  for (const row of rows) {
    if (typeof row.name !== "string" || typeof row.amount !== "number") continue;
    valid.push({ name: row.name.trim(), amount: row.amount });
  }
  valid.sort((a, b) => a.name.localeCompare(b.name));
  let total = 0;
  const lines = [];
  for (const row of valid) {
    total += row.amount;
    // biome-ignore lint/style/useTemplate: Deliberately plain legacy style for refactoring exercises.
    lines.push(row.name + ": " + row.amount.toFixed(2));
  }
  // biome-ignore lint/style/useTemplate: Deliberately plain legacy style for refactoring exercises.
  if (options.includeTotal !== false) lines.push("Total: " + total.toFixed(2));
  return { text: lines.join("\n"), count: valid.length, total };
}
