export const BACKEND_CODE_BY_SDK_CODE: Record<string, string> = {
  FRA: 'FRA_SAS',
  ITA: 'ITA_APL',
};

const UP_TO_DATE_UNTOUCHED = new Set(['FRA']);

const CODE_CELL = 2;
const CONTRACT_DETAILS_CELL = 3;
const PLATFORM_CELL = 4;
const UP_TO_DATE_CELL = 5;

function withCellValue(cell: string, value: string): string {
  return ` ${value.padEnd(cell.length - 2)} `;
}

/**
 * Updates the "Remote platform" and "Up to date" columns of the README's
 * Version Matrix from the latest version counts. Rows it can't read are
 * returned in `unreadableRows` and left untouched.
 */
export function updateVersionMatrix(
  readme: string,
  latestCounts: Record<string, number>,
): { content: string; unreadableRows: string[] } {
  const unreadableRows: string[] = [];
  const content = readme.split('\n').map((line) => {
    const cells = line.split('|');
    if (cells.length !== 8 || !line.startsWith('| ')) {
      return line;
    }
    const code = cells[CODE_CELL].trim();
    const latest = latestCounts[BACKEND_CODE_BY_SDK_CODE[code] ?? code];
    if (latest === undefined) {
      return line;
    }
    const pinnedMatch = /^v(\d+)$/.exec(cells[CONTRACT_DETAILS_CELL].trim());
    if (!pinnedMatch) {
      unreadableRows.push(line);
      return line;
    }
    cells[PLATFORM_CELL] = withCellValue(cells[PLATFORM_CELL], `v${latest}`);
    if (!UP_TO_DATE_UNTOUCHED.has(code)) {
      cells[UP_TO_DATE_CELL] = withCellValue(
        cells[UP_TO_DATE_CELL],
        Number(pinnedMatch[1]) >= latest ? 'Yes' : 'No',
      );
    }
    return cells.join('|');
  });
  return { content: content.join('\n'), unreadableRows };
}
