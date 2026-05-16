function escapeCsv(value: unknown) {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function createCsv(columns: string[], rows: Array<Record<string, unknown>>) {
  const header = columns.map(escapeCsv).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(',')).join('\n');
  return `${header}\n${body}`;
}