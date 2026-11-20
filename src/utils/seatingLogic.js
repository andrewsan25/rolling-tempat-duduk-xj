// Daftar 40 label kode kursi sesuai urutan Snake Pattern (indeks 0 - 39)
export const SNAKE_LABELS = [
  // Baris 1 (Kiri -> Kanan): [A, B], [C, D], [E, F], [G, H]
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  // Baris 2 (Kanan -> Kiri): [P, O], [N, M], [L, K], [J, I] -> Urutan indeks 8..15 adalah I..P
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  // Baris 3 (Kiri -> Kanan): [Q, R], [S, T], [U, V], [W, X]
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  // Baris 4 (Kanan -> Kiri): [ff, ee], [dd, cc], [bb, aa], [Z, Y] -> Urutan indeks 24..31 adalah Y..ff
  'Y', 'Z', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff',
  // Baris 5 (Kiri -> Kanan): [gg, HH], [ii, jj], [kk, ll], [mm, nn]
  'gg', 'HH', 'ii', 'jj', 'kk', 'll', 'mm', 'nn',
];

export function createDefaultSeats() {
  return SNAKE_LABELS.map((code, index) => {
    const row = Math.floor(index / 8); // 0..4
    const isEvenRow = row % 2 === 0;
    const posInRow = index % 8; // 0..7

    const col = isEvenRow ? Math.floor(posInRow / 2) : 3 - Math.floor(posInRow / 2);
    const isRightSeat = isEvenRow ? index % 2 === 1 : index % 2 === 0;

    return {
      id: index + 1,
      snakeIndex: index,
      kode_kursi: code,
      nama_siswa: `Siswa ${code}`,
      row,
      col,
      is_right_seat: isRightSeat,
    };
  });
}

export function getDeskSeats(seats, row, col) {
  const isEvenRow = row % 2 === 0;

  if (isEvenRow) {
    const leftIdx = row * 8 + col * 2;
    const rightIdx = leftIdx + 1;
    return {
      leftSeat: seats[leftIdx],
      rightSeat: seats[rightIdx],
      leftIdx,
      rightIdx,
    };
  } else {
    const rightIdx = row * 8 + (3 - col) * 2;
    const leftIdx = rightIdx + 1;
    return {
      leftSeat: seats[leftIdx],
      rightSeat: seats[rightIdx],
      leftIdx,
      rightIdx,
    };
  }
}

/**
 * Logika 1: Rotasi Biasa (Geser 1 Langkah mengikuti Snake Pattern 0 -> 39)
 */
export function rotateSnakeOneStep(seats) {
  const nextSeats = seats.map((seat) => ({ ...seat }));
  const total = seats.length; // 40

  for (let i = 0; i < total; i++) {
    const targetIdx = (i + 1) % total;
    nextSeats[targetIdx].nama_siswa = seats[i].nama_siswa;
  }

  return nextSeats;
}

/**
 * Logika 2: Rotasi 5 Hari (Hanya Kursi Kanan yang Maju 1 Baris pada Kolom yang Sama)
 */
export function rotateFiveDaysRightSeats(seats) {
  const nextSeats = seats.map((seat) => ({ ...seat }));

  for (let col = 0; col < 4; col++) {
    const rightSeatIndices = [0, 1, 2, 3, 4].map((row) => {
      const { rightIdx } = getDeskSeats(seats, row, col);
      return rightIdx;
    });

    for (let r = 0; r < 5; r++) {
      const currentRightIdx = rightSeatIndices[r];
      const sourceRightIdx = rightSeatIndices[(r + 1) % 5];
      nextSeats[currentRightIdx].nama_siswa = seats[sourceRightIdx].nama_siswa;
    }
  }

  return nextSeats;
}

/**
 * Logika 3: Reroll / Acak Tempat Duduk (Fisher-Yates Shuffle)
 * Mengacak posisi seluruh 40 siswa secara merata.
 */
export function rerollRandomSeats(seats) {
  const nextSeats = seats.map((seat) => ({ ...seat }));
  const names = seats.map((s) => s.nama_siswa);

  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = names[i];
    names[i] = names[j];
    names[j] = temp;
  }

  for (let i = 0; i < nextSeats.length; i++) {
    nextSeats[i].nama_siswa = names[i];
  }

  return nextSeats;
}
