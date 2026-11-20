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
} from 'lucide-react';
import {
  ROLES_CONFIG,
  getEffectiveRolePassword,
} from '../../utils/authRoles';

export default function AdminAccountsTab({
  rolePasswords = {},
  onSaveRolePasswords,
}) {
  const [visibleMap, setVisibleMap] = useState({});
  const [editingPassMap, setEditingPassMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

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

  return (
    <div className="space-y-6">
      {/* Header Banner Khusus Admin */}
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
              Lihat username & password aktif seluruh akun pengurus/murid, ubah password, atau reset kembali ke default.
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

      {/* Daftar Akun Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ROLES_CONFIG.map((role) => {
          const currentPassword = getEffectiveRolePassword(role.id, rolePasswords);
          const isCustom =
            rolePasswords[role.id] &&
            rolePasswords[role.id] !== role.defaultPassword;
          const isVisible = visibleMap[role.id] !== false; // Default tampil untuk Admin
          const draftPass = editingPassMap[role.id] ?? '';

          return (
            <div
              key={role.id}
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-[#DECBB3] flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Header */}
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

                {/* Box Kredensial Aktif */}
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

              {/* Form Ubah Password & Tombol Reset ke Default */}
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
  );
}
