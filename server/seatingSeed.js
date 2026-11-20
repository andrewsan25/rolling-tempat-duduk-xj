export const SNAKE_LABELS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff',
  'gg', 'HH', 'ii', 'jj', 'kk', 'll', 'mm', 'nn',
];

export function buildDefaultSeatRows() {
  return SNAKE_LABELS.map((code, index) => {
    const row = Math.floor(index / 8);
    const isEvenRow = row % 2 === 0;
    const posInRow = index % 8;
    const col = isEvenRow ? Math.floor(posInRow / 2) : 3 - Math.floor(posInRow / 2);
    const isRightSeat = isEvenRow ? index % 2 === 1 : index % 2 === 0;

    return {
      id: index + 1,
      snake_index: index,
      kode_kursi: code,
      nama_siswa: `Siswa ${code}`,
      row_index: row,
      col_index: col,
      is_right_seat: isRightSeat,
    };
  });
}

export function mapDbRowToApi(row) {
  return {
    id: row.id,
    snakeIndex: row.snake_index,
    kode_kursi: row.kode_kursi,
    nama_siswa: row.nama_siswa,
    row: row.row_index,
    col: row.col_index,
    is_right_seat: row.is_right_seat,
    updated_at: row.updated_at,
  };
}
