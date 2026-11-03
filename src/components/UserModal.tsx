import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, UserRole } from '../types';
import { X, Shield, Save, Eye, EyeOff, Upload, Trash2 } from 'lucide-react';
import { UserAvatar } from './BrandLogos';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<UserAccount, 'id'> & { id?: string | number }) => void;
  user?: UserAccount | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user
}) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  const [info, setInfo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNama(user.nama || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setPassword(user.password || '');
      setRole(user.role || 'Admin');
      setInfo(user.info || '');
      setAvatarUrl(user.avatarUrl);
    } else {
      setNama('');
      setEmail('');
      setUsername('');
      setPassword('');
      setRole('Admin');
      setInfo('');
      setAvatarUrl(undefined);
    }
    setShowPassword(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto profil maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !username.trim() || !password.trim()) return;

    onSave({
      ...(user ? { id: user.id } : {}),
      nama: nama.trim(),
      email: email.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
      info: info.trim(),
      avatarUrl
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                {user ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otorisasi peran dan hak akses sistem
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {/* Avatar / Logo Akun Section */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <UserAvatar url={avatarUrl} role={role} name={nama || 'User'} size="lg" />
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Logo / Foto Profil Akun
              </label>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Gunakan lambang resmi peran atau unggah foto khusus
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                >
                  <Upload className="w-3 h-3" /> Unggah Foto
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(undefined)}
                    className="px-2.5 py-1 text-slate-500 hover:text-red-500 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" /> Reset Lambang
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Pengguna <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Nuryaman, S.Kom."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email atau NIP
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smpn18.sch.id"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Peran / Hak Akses <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-amber-600 dark:text-amber-400 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Admin">Admin (Akses Penuh)</option>
              <option value="Kepala Sekolah">Kepala Sekolah (Monitoring)</option>
              <option value="Guru">Guru / Wali Kelas (Presensi & Data)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Informasi Tambahan / Jabatan
            </label>
            <input
              type="text"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Contoh: Operator Utama, Wali Kelas VII-A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
