import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  ShieldAlert,
  Save,
  Copy,
  Users,
  UserPlus,
  Trash2,
  NotebookPen,
} from 'lucide-react';
import {
  ROLES_CONFIG,
  getEffectiveRolePassword,
} from '../../utils/authRoles';

export default function AdminAccountsTab({
  rolePasswords = {},
  registeredStudents = [],
  personalNotesMap = {},
  onSaveRolePasswords,
  onSaveRegisteredStudents,
}) {
  const [visibleMap, setVisibleMap] = useState({});
  const [editingPassMap, setEditingPassMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');

  const toggleShowPassword = (roleId) => {
    setVisibleMap((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  const handleCopyCredentials = (role) => {
    const activePass = getEffectiveRolePassword(role.id, rolePasswords);
    navigator.clipboard?.writeText(
      `Role: ${role.roleName} | Username: ${role.username} | Password: ${activePass}`
    );
    setCopiedId(role.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleChangeNewPassword = (roleId, val) => {
    setEditingPassMap((prev) => ({ ...prev, [roleId]: val }));
  };

  const handleSaveCustomPassword = (roleId) => {
    const newPass = (editingPassMap[roleId] || '').trim();
    if (!newPass) return;

    const updatedMap = {
      ...rolePasswords,
      [roleId]: newPass,
    };
    onSaveRolePasswords(
      updatedMap,
      `Password untuk akun ${roleId} berhasil diperbarui!`
    );
    setEditingPassMap((prev) => ({ ...prev, [roleId]: '' }));
  };

  const handleResetSinglePassword = (role) => {
    const updatedMap = { ...rolePasswords };
    delete updatedMap[role.id];
    onSaveRolePasswords(
      updatedMap,
      `Password ${role.roleName} berhasil di-reset ke default (${role.defaultPassword}).`
    );
    setEditingPassMap((prev) => ({ ...prev, [role.id]: '' }));
  };

  const handleResetAllPasswords = () => {
    onSaveRolePasswords(
      {},
      'Seluruh password akun berhasil di-reset ke pengaturan default!'
    );
    setEditingPassMap({});
  };

  const handleAddStudentAccount = (e) => {
    e.preventDefault();
    const cleanName = newStudentName.trim();
    if (!cleanName) return;

    const userKey = `murid_${cleanName.toLowerCase().replace(/\s+/g, '_')}`;
    const nowIso = new Date().toISOString();
    const exists = registeredStudents.some(
      (s) =>
        s.userKey === userKey ||
        (s.name && s.name.toLowerCase() === cleanName.toLowerCase())
    );

    if (exists) {
      setNewStudentName('');
      return;
    }

    const nextList = [
      {
        id: userKey,
        name: cleanName,
        userKey,
        registeredAt: nowIso,
        lastLoginAt: nowIso,
      },
      ...registeredStudents,
    ];
    onSaveRegisteredStudents(
      nextList,
      `Akun murid "${cleanName}" berhasil ditambahkan!`
    );
    setNewStudentName('');
  };

  const handleDeleteStudentAccount = (student) => {
    const nextList = registeredStudents.filter(
      (s) => s.userKey !== student.userKey && s.name !== student.name
    );
    onSaveRegisteredStudents(
      nextList,
      `Akun murid "${student.name}" berhasil dihapus dari daftar.`
    );
  };

  return (
    <div className="space-y-8">
      {/* BAGIAN 1: Akun Pengurus & Role Utama */}
      <div className="space-y-5">
        <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4A3322] text-[#FFFDF9] flex items-center justify-center shadow-sm shrink-0">
              <KeyRound className="w-5 h-5 text-[#E06D3B]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Akses Eksklusif Admin Utama</span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#2C1E14]">
                Manajemen Akun & Reset Password Role
              </h2>
              <p className="text-xs text-[#7A624E]">
                Lihat username & password aktif seluruh akun pengurus/role, ubah password, atau reset kembali ke default.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAllPasswords}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#4A3322] border border-[#DECBB3] text-xs font-bold transition-all cursor-pointer self-start sm:self-center shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8C6239]" />
            <span>Reset Semua ke Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ROLES_CONFIG.map((role) => {
            const currentPassword = getEffectiveRolePassword(role.id, rolePasswords);
            const isCustom =
              rolePasswords[role.id] &&
              rolePasswords[role.id] !== role.defaultPassword;
            const isVisible = visibleMap[role.id] !== false;
            const draftPass = editingPassMap[role.id] ?? '';

            return (
              <div
                key={role.id}
                className="glass-panel rounded-3xl p-5 sm:p-6 border border-[#DECBB3] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${role.badgeColor}`}
                      >
                        {role.roleName}
                      </span>
                      {isCustom ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Password Diubah
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EFE5D8] text-[#6F4E37] text-[10px] font-bold">
                          Default
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(role)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF5EE] hover:bg-[#EFE5D8] border border-[#DECBB3] text-[11px] font-semibold text-[#5C4028] cursor-pointer"
                      title="Salin Username & Password"
                    >
                      {copiedId === role.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E2D2BE]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C735E] block mb-0.5">
                        Username
                      </span>
                      <code className="font-bold text-sm text-[#2C1E14]">
                        {role.username}
                      </code>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C735E]">
                          Password Aktif
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(role.id)}
                          className="text-[#8C6239] hover:text-[#5C3D22] cursor-pointer"
                          title={isVisible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <code className="font-bold text-sm text-[#8C6239] break-all">
                        {isVisible ? currentPassword : '••••••••••'}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6D7C3] space-y-2.5">
                  <label className="block text-[11px] font-bold text-[#5C4028]">
                    Ganti / Set Password Baru untuk {role.roleName}:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={draftPass}
                      onChange={(e) =>
                        handleChangeNewPassword(role.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveCustomPassword(role.id);
                        }
                      }}
                      placeholder={`Password baru (default: ${role.defaultPassword})...`}
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-xs font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
                    />

                    <button
                      type="button"
                      onClick={() => handleSaveCustomPassword(role.id)}
                      disabled={!draftPass.trim()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C140E] hover:bg-[#2C1E14] disabled:opacity-40 text-[#FAF5EE] text-xs font-semibold transition-all cursor-pointer shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetSinglePassword(role)}
                      title={`Reset ke password default (${role.defaultPassword})`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#5C3D22] border border-[#DECBB3] text-xs font-semibold transition-all cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BAGIAN 2: Daftar Akun Murid yang Register Nama */}
      <div className="space-y-4">
        <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#2C1E14]">
                Daftar Akun Murid Terdaftar (Register Nama) ({registeredStudents.length})
              </h3>
              <p className="text-xs text-[#7A624E]">
                Seluruh murid yang masuk melalui form Register Murid (hanya tulis nama) tercatat di bawah ini.
              </p>
            </div>
          </div>

          {/* Form Tambah Akun Murid oleh Admin */}
          <form
            onSubmit={handleAddStudentAccount}
            className="flex items-center gap-2 w-full lg:w-auto"
          >
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Tambah nama akun murid..."
              className="flex-1 lg:w-56 px-3.5 py-2 rounded-full bg-[#FFFDF9] border border-[#DECBB3] text-xs font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] text-xs font-semibold cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Murid</span>
            </button>
          </form>
        </div>

        {registeredStudents.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-sm text-[#8C735E]">
            Belum ada murid yang melakukan register nama. Saat murid masuk dengan namanya, akunnya akan otomatis muncul di sini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredStudents.map((student) => {
              const studentNotes =
                (personalNotesMap && personalNotesMap[student.userKey]) || [];
              const regDate = student.registeredAt
                ? student.registeredAt.slice(0, 10)
                : '-';

              return (
                <div
                  key={student.userKey || student.name}
                  className="glass-panel rounded-2xl p-4 border border-[#DECBB3] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[#2C1E14] truncate">
                        {student.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#EFE5D8] text-[#5C4028] text-[10px] font-bold shrink-0">
                        Murid
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7A624E]">
                      <span className="inline-flex items-center gap-1">
                        <NotebookPen className="w-3 h-3 text-[#8C6239]" />
                        <span>{studentNotes.length} Notes Pribadi</span>
                      </span>
                      <span>&bull; Terdaftar: {regDate}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteStudentAccount(student)}
                    title={`Hapus akun murid ${student.name}`}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
