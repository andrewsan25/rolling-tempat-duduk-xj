import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(num) || 0);
}

export default function FinanceTab({
  finance = [],
  canEdit = false,
  onSaveFinance,
  currentUser,
}) {
  const today = new Date();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Uang Kas');
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    finance.forEach((item) => {
      const val = Number(item.amount) || 0;
      if (item.type === 'income') totalIncome += val;
      else totalExpense += val;
    });
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [finance]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!canEdit || !title.trim() || !amount) return;

    const cleanAmount = Math.abs(Number(amount));
    if (!cleanAmount) return;

    const newTx = {
      id: `fin-${Date.now()}`,
      date,
      title: title.trim(),
      category,
      type,
      amount: cleanAmount,
    };

    onSaveFinance([newTx, ...finance]);
    setTitle('');
    setAmount('');
  };

  const handleDeleteTransaction = (id) => {
    if (!canEdit) return;
    onSaveFinance(finance.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#2C1E14]">
              Laporan Keuangan & Kas Kelas X-J
            </h2>
            <p className="text-xs text-[#7A624E]">
              Transparansi catatan uang kas masuk, pengeluaran kelas, dan saldo akhir.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            canEdit
              ? 'bg-[#8C6239] text-[#FFFDF9]'
              : 'bg-[#EFE5D8] text-[#6F4E37] border border-[#DECBB3]'
          }`}
        >
          {canEdit ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mode Edit ({currentUser?.roleName})</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Hanya Lihat / Read-Only ({currentUser?.roleName})</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-3xl p-5 border border-[#DECBB3]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A624E]">
              Total Pemasukan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-emerald-700">
            {formatRupiah(summary.totalIncome)}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-[#DECBB3]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A624E]">
              Total Pengeluaran
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-rose-700">
            {formatRupiah(summary.totalExpense)}
          </div>
        </div>

        <div className="rounded-3xl p-5 espresso-panel text-[#FFFDF9]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E06D3B]">
              Saldo Akhir Kas Kelas
            </span>
            <Wallet className="w-5 h-5 text-[#E06D3B]" />
          </div>
          <div className="font-display text-2xl font-extrabold">
            {formatRupiah(summary.balance)}
          </div>
        </div>
      </div>

      {canEdit && (
        <form
          onSubmit={handleAddTransaction}
          className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 border-2 border-[#C8AA88]"
        >
          <h3 className="font-display font-bold text-base text-[#2C1E14] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#8C6239]" />
            <span>Catat Transaksi Kas Baru</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Jenis Transaksi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
              >
                <option value="income">Pemasukan (+)</option>
                <option value="expense">Pengeluaran (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
              >
                <option value="Uang Kas">Uang Kas</option>
                <option value="Perlengkapan">Perlengkapan Kelas</option>
                <option value="Kebersihan">Alat Kebersihan</option>
                <option value="Acara Kelas">Acara / Event Kelas</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="Contoh: 50000"
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Keterangan transaksi (mis: Iuran Kas Minggu ke-3)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] text-sm font-semibold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden border border-[#DECBB3]">
        <div className="px-5 py-4 border-b border-[#E6D7C3] flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-[#2C1E14]">
            Riwayat Transaksi Kas Kelas ({finance.length})
          </h3>
        </div>

        <div className="divide-y divide-[#E6D7C3]">
          {finance.map((item) => (
            <div
              key={item.id}
              className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#FAF5EE]/60 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#8C6239]">
                    {item.date}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#EFE5D8] text-[#5C4028] text-[10px] font-bold">
                    {item.category}
                  </span>
                </div>
                <div className="font-semibold text-sm text-[#2C1E14]">
                  {item.title}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-display font-bold text-sm sm:text-base ${
                    item.type === 'income'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                </span>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTransaction(item.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
