import React, { useState } from 'react';
import { Sparkles, Lock, Plus, X, ClipboardCheck } from 'lucide-react';

export default function PiketTab({
  piket = [],
  canEdit = false,
  onSavePiket,
  currentUser,
}) {
  const [newMemberByDay, setNewMemberByDay] = useState({});

  const handleAddMember = (dayName) => {
    if (!canEdit) return;
    const name = (newMemberByDay[dayName] || '').trim();
    if (!name) return;

    const updated = piket.map((item) =>
      item.day === dayName
        ? { ...item, members: [...item.members, name] }
        : item
    );

    onSavePiket(updated);
    setNewMemberByDay((prev) => ({ ...prev, [dayName]: '' }));
  };

  const handleRemoveMember = (dayName, memberIdx) => {
    if (!canEdit) return;
    const updated = piket.map((item) =>
      item.day === dayName
        ? {
            ...item,
            members: item.members.filter((_, idx) => idx !== memberIdx),
          }
        : item
    );
    onSavePiket(updated);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center shadow-sm">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#2C1E14]">
              Jadwal Piket Harian Kelas X-J
            </h2>
            <p className="text-xs text-[#7A624E]">
              Daftar pembagian regu piket kebersihan kelas dari hari Senin hingga Jumat.
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
              <span>Hanya Lihat (Read-Only)</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {piket.map((dayItem) => (
          <div
            key={dayItem.day}
            className="glass-panel rounded-3xl p-5 flex flex-col justify-between border border-[#DECBB3]"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6D7C3]">
                <h3 className="font-display text-base font-extrabold text-[#2C1E14]">
                  Hari {dayItem.day}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EFE5D8] text-[#6F4E37] text-[11px] font-bold">
                  {dayItem.members.length} Siswa
                </span>
              </div>

              <p className="text-xs text-[#7A624E] mb-4 leading-relaxed">
                {dayItem.note}
              </p>

              <div className="space-y-2 mb-4">
                {dayItem.members.map((member, idx) => (
                  <div
                    key={`${dayItem.day}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E6D7C3] text-xs font-semibold text-[#2C1E14]"
                  >
                    <span>
                      {idx + 1}. {member}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(dayItem.day, idx)}
                        className="text-[#A8927E] hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {canEdit && (
              <div className="pt-2 border-t border-[#E6D7C3] flex items-center gap-1.5">
                <input
                  type="text"
                  value={newMemberByDay[dayItem.day] || ''}
                  onChange={(e) =>
                    setNewMemberByDay((prev) => ({
                      ...prev,
                      [dayItem.day]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember(dayItem.day);
                    }
                  }}
                  placeholder="Tambah siswa..."
                  className="w-full min-w-0 px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-xs text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
                />
                <button
                  type="button"
                  onClick={() => handleAddMember(dayItem.day)}
                  className="p-1.5 rounded-xl bg-[#1C140E] hover:bg-[#2C1E14] text-[#FFFDF9] shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
