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

/**
 * Menghasilkan 40 data kursi default (fallback jika backend belum memiliki data)
 * Indeks array 0-39 selalu berurutan sesuai Snake Pattern.
 */
export function createDefaultSeats() {
  return SNAKE_LABELS.map((code, index) => {
    const row = Math.floor(index / 8); // 0..4
    const isEvenRow = row % 2 === 0;
    const posInRow = index % 8; // 0..7

    // Pada baris genap (Baris 1, 3, 5 -> arah Kiri ke Kanan):
    // Meja ke-col berada di posInRow / 2, kursi Kanan adalah indeks ganjil (B, D, F, H, dst.)
    // Pada baris ganjil (Baris 2, 4 -> arah Kanan ke Kiri):
    // Urutan ular masuk dari kolom paling kanan (I di kanan, J di kiri -> [J, I])
    // sehingga indeks genap (8=I, 10=K, 12=M, 14=O) justru berada di posisi Kursi KANAN meja!
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

/**
 * Mengambil pasangan kursi [leftSeat, rightSeat] untuk meja pada (row, col)
 * di mana row = 0..4 (Baris 1..5) dan col = 0..3 (Kolom 1..4 dari Kiri ke Kanan).
 *
 * Hasil pemetaan visual:
 * - Baris 1 (row 0): [A, B], [C, D], [E, F], [G, H]
 * - Baris 2 (row 1): [P, O], [N, M], [L, K], [J, I]
 * - Baris 3 (row 2): [Q, R], [S, T], [U, V], [W, X]
 * - Baris 4 (row 3): [ff, ee], [dd, cc], [bb, aa], [Z, Y]
 * - Baris 5 (row 4): [gg, HH], [ii, jj], [kk, ll], [mm, nn]
 */
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
    // Baris ganjil (arah Kanan -> Kiri):
    // Contoh row=1, col=0 (meja paling kiri): rightIdx = 14 (O), leftIdx = 15 (P) -> tampil [P, O]
    // Contoh row=1, col=3 (meja paling kanan): rightIdx = 8 (I), leftIdx = 9 (J) -> tampil [J, I]
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
 * Siswa di indeks i bergeser ke i + 1, dan siswa di indeks 39 kembali ke indeks 0.
 * Kursi/meja fisik tetap pada tempatnya, hanya data siswa yang berpindah.
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
 * Contoh Kolom 1 (paling kiri):
 * HH (Baris 5) -> ee (Baris 4) -> R (Baris 3) -> O (Baris 2) -> B (Baris 1) -> berputar ke HH (Baris 5).
 * Kursi Kiri (A, P, Q, ff, gg, dst.) tetap diam di tempatnya.
 */
export function rotateFiveDaysRightSeats(seats) {
  const nextSeats = seats.map((seat) => ({ ...seat }));

  // Iterasi setiap kolom (0 sampai 3)
  for (let col = 0; col < 4; col++) {
    // Dapatkan indeks array untuk Kursi Kanan di setiap baris (row 0..4) pada kolom ini
    const rightSeatIndices = [0, 1, 2, 3, 4].map((row) => {
      const { rightIdx } = getDeskSeats(seats, row, col);
      return rightIdx;
    });

    // Geser maju 1 baris (dari row r ke row r - 1, dan dari row 0 berputar ke row 4)
    // rightSeatIndices = [idxRow0, idxRow1, idxRow2, idxRow3, idxRow4]
    // Contoh Col 0: [1 (B), 14 (O), 17 (R), 30 (ee), 33 (HH)]
    for (let r = 0; r < 5; r++) {
      const currentRightIdx = rightSeatIndices[r];
      // Baris r diisi oleh siswa dari baris di belakangnya ((r + 1) % 5)
      // Sehingga:
      // r=0 (B) diisi dari r=1 (O) -> O maju ke B
      // r=1 (O) diisi dari r=2 (R) -> R maju ke O
      // r=2 (R) diisi dari r=3 (ee) -> ee maju ke R
      // r=3 (ee) diisi dari r=4 (HH) -> HH maju ke ee
      // r=4 (HH) diisi dari r=0 (B) -> B berputar ke belakang menjadi HH
      const sourceRightIdx = rightSeatIndices[(r + 1) % 5];
      nextSeats[currentRightIdx].nama_siswa = seats[sourceRightIdx].nama_siswa;
    }
  }

  return nextSeats;
}
