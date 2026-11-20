-- ============================================================
-- Schema Database Supabase: Sistem Rolling Tempat Duduk Kelas
-- Jalankan script ini di Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.seats (
  id INTEGER PRIMARY KEY,
  snake_index INTEGER UNIQUE NOT NULL,
  kode_kursi TEXT NOT NULL,
  nama_siswa TEXT NOT NULL,
  row_index INTEGER NOT NULL,
  col_index INTEGER NOT NULL,
  is_right_seat BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk mempercepat sorting berdasarkan alur snake pattern
CREATE INDEX IF NOT EXISTS idx_seats_snake_index ON public.seats (snake_index);

-- Trigger otomatis untuk memperbarui updated_at setiap ada perubahan
CREATE OR REPLACE FUNCTION public.set_seats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seats_updated_at ON public.seats;
CREATE TRIGGER trg_seats_updated_at
BEFORE UPDATE ON public.seats
FOR EACH ROW
EXECUTE FUNCTION public.set_seats_updated_at();

-- Aktifkan Row Level Security (RLS)
-- Backend menggunakan SUPABASE_SERVICE_ROLE_KEY yang secara otomatis melewati RLS.
-- Jika Anda memakai SUPABASE_ANON_KEY di backend/dev, policy di bawah mengizinkan baca/tulis.
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read write seats" ON public.seats;
CREATE POLICY "Allow read write seats"
ON public.seats
FOR ALL
USING (true)
WITH CHECK (true);

-- Seed 40 kursi awal sesuai Snake Pattern (indeks 0 - 39)
INSERT INTO public.seats (id, snake_index, kode_kursi, nama_siswa, row_index, col_index, is_right_seat)
VALUES
  -- Baris 1 (Kiri -> Kanan): [A, B], [C, D], [E, F], [G, H]
  (1,  0,  'A',  'Siswa A',  0, 0, false),
  (2,  1,  'B',  'Siswa B',  0, 0, true),
  (3,  2,  'C',  'Siswa C',  0, 1, false),
  (4,  3,  'D',  'Siswa D',  0, 1, true),
  (5,  4,  'E',  'Siswa E',  0, 2, false),
  (6,  5,  'F',  'Siswa F',  0, 2, true),
  (7,  6,  'G',  'Siswa G',  0, 3, false),
  (8,  7,  'H',  'Siswa H',  0, 3, true),
  -- Baris 2 (Kanan -> Kiri): [P, O], [N, M], [L, K], [J, I]
  (9,  8,  'I',  'Siswa I',  1, 3, true),
  (10, 9,  'J',  'Siswa J',  1, 3, false),
  (11, 10, 'K',  'Siswa K',  1, 2, true),
  (12, 11, 'L',  'Siswa L',  1, 2, false),
  (13, 12, 'M',  'Siswa M',  1, 1, true),
  (14, 13, 'N',  'Siswa N',  1, 1, false),
  (15, 14, 'O',  'Siswa O',  1, 0, true),
  (16, 15, 'P',  'Siswa P',  1, 0, false),
  -- Baris 3 (Kiri -> Kanan): [Q, R], [S, T], [U, V], [W, X]
  (17, 16, 'Q',  'Siswa Q',  2, 0, false),
  (18, 17, 'R',  'Siswa R',  2, 0, true),
  (19, 18, 'S',  'Siswa S',  2, 1, false),
  (20, 19, 'T',  'Siswa T',  2, 1, true),
  (21, 20, 'U',  'Siswa U',  2, 2, false),
  (22, 21, 'V',  'Siswa V',  2, 2, true),
  (23, 22, 'W',  'Siswa W',  2, 3, false),
  (24, 23, 'X',  'Siswa X',  2, 3, true),
  -- Baris 4 (Kanan -> Kiri): [ff, ee], [dd, cc], [bb, aa], [Z, Y]
  (25, 24, 'Y',  'Siswa Y',  3, 3, true),
  (26, 25, 'Z',  'Siswa Z',  3, 3, false),
  (27, 26, 'aa', 'Siswa aa', 3, 2, true),
  (28, 27, 'bb', 'Siswa bb', 3, 2, false),
  (29, 28, 'cc', 'Siswa cc', 3, 1, true),
  (30, 29, 'dd', 'Siswa dd', 3, 1, false),
  (31, 30, 'ee', 'Siswa ee', 3, 0, true),
  (32, 31, 'ff', 'Siswa ff', 3, 0, false),
  -- Baris 5 (Kiri -> Kanan): [gg, HH], [ii, jj], [kk, ll], [mm, nn]
  (33, 32, 'gg', 'Siswa gg', 4, 0, false),
  (34, 33, 'HH', 'Siswa HH', 4, 0, true),
  (35, 34, 'ii', 'Siswa ii', 4, 1, false),
  (36, 35, 'jj', 'Siswa jj', 4, 1, true),
  (37, 36, 'kk', 'Siswa kk', 4, 2, false),
  (38, 37, 'll', 'Siswa ll', 4, 2, true),
  (39, 38, 'mm', 'Siswa mm', 4, 3, false),
  (40, 39, 'nn', 'Siswa nn', 4, 3, true)
ON CONFLICT (id) DO NOTHING;
