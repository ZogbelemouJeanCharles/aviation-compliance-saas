/**
 * Minimal CSV parser: comma-separated, first row = headers, double-quote
 * escaping for fields containing commas/quotes/newlines (RFC 4180-ish).
 * The FAA Releasable File download is plain CSV, so this covers it without
 * pulling in a parsing library for one file format.
 */
export function parseCsv(content: string): Record<string, string>[] {
  const rows = parseRows(content);
  if (rows.length === 0) return [];

  const [header, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.length > 1 || row[0] !== "")
    .map((row) => {
      const record: Record<string, string> = {};
      header.forEach((column, index) => {
        record[column.trim()] = (row[index] ?? "").trim();
      });
      return record;
    });
}

function parseRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n") {
      pushRow();
    } else if (char === "\r") {
      // skip, \n handles the row break
    } else {
      field += char;
    }
  }

  // Last field/row if the file doesn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows;
}
