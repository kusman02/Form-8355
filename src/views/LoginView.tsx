import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, ChevronDown, Sparkles, Calendar } from 'lucide-react';

interface LoginViewProps {
  userAccounts: UserAccount[];
  npsn: string;
  defaultTahunAjaran?: string;
  onLoginSuccess: (account: UserAccount, tahunAjaran: string) => void;
  showToast: (msg: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  userAccounts,
  npsn,
  defaultTahunAjaran,
  onLoginSuccess,
  showToast
}) => {
  const [role, setRole] = useState<UserRole>('Admin');
  const [tahunAjaran, setTahunAjaran] = useState(defaultTahunAjaran || localStorage.getItem('smpn18_tahun_ajaran') || '2026/2027');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanTahunAjaran = tahunAjaran.trim() || '2026/2027';

    // Check account match
    const account = userAccounts.find(u =>
      String(u.username).trim() === cleanUsername &&
      String(u.password).trim() === cleanPassword &&
      String(u.role).trim().toLowerCase() === String(role).trim().toLowerCase()
    );

    if (account) {
      localStorage.setItem('smpn18_tahun_ajaran', cleanTahunAjaran);
      if (remember) {
        localStorage.setItem('smpn18_saved_user_id', String(account.id));
      }
      onLoginSuccess(account, cleanTahunAjaran);
      showToast(`Selamat datang kembali, ${account.nama}! (${account.role} - T.A ${cleanTahunAjaran})`);
    } else {
      showToast("Username, Kata Sandi, atau Kategori User tidak cocok!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040711] flex flex-col justify-between text-white overflow-y-auto select-none bg-grid-pattern">
      {/* Glowing Light Orbs in Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-indigo-600/25 rounded-full blur-[120px] pointer-events-none orb-pulse-1"></div>
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-700/20 rounded-full blur-[100px] pointer-events-none orb-pulse-2"></div>
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-sky-500/15 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Top Navigation Header */}
      <header className="py-2.5 px-4 sm:px-8 flex items-center justify-between border-b border-blue-900/30 bg-[#040711]/80 backdrop-blur-md relative z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-cyan-400/50 flex items-center justify-center text-cyan-200 font-extrabold text-sm shadow-lg shadow-blue-600/30">
            18
          </div>
          <div>
            <h1 className="font-bold text-white text-xs sm:text-sm leading-tight tracking-wide flex items-center gap-2">
              <span>SMP NEGERI 18 JAKARTA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-cyan-400 font-medium">Sistem Informasi Data Siswa Form 8355</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-cyan-500/30 text-xs text-slate-300 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span className="font-semibold text-[11px] text-cyan-200">Sistem Online & Aktif</span>
          </div>
          <div className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            NPSN: <span className="text-cyan-300 font-bold">{npsn}</span>
          </div>
        </div>
      </header>

      {/* Center Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6 relative z-20 my-auto">
        <div className="w-full max-w-[410px] glass-card-glow rounded-2xl sm:rounded-3xl p-5 sm:p-6 sm:py-7 relative overflow-hidden space-y-4 sm:space-y-5 shadow-2xl">
          {/* Top Accent Neon Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_#38bdf8]"></div>

          {/* Logo Badge */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 blur opacity-60 animate-pulse"></div>
              <div className="relative w-13 h-13 rounded-2xl bg-[#090e1d] border border-cyan-400/50 flex items-center justify-center text-amber-300 font-black text-xl shadow-xl">
                18
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200">
                Sistem Aplikasi 8355
              </h2>
              <p className="text-[11px] sm:text-xs text-cyan-400/80 mt-0.5">Silakan masuk menggunakan akun terdaftar</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">Kategori User</label>
              <div className="relative group">
                <Shield className="w-4 h-4 absolute left-3.5 top-2.5 text-cyan-500 group-focus-within:text-cyan-300 transition" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-blue-900/50 bg-[#060a14]/90 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-400 transition shadow-inner appearance-none cursor-pointer"
                >
                  <option value="Admin" className="bg-[#090e1d] text-white">Admin (Akses Penuh)</option>
                  <option value="Kepala Sekolah" className="bg-[#090e1d] text-white">Kepala Sekolah (Monitoring)</option>
                  <option value="Guru" className="bg-[#090e1d] text-white">Guru / Wali Kelas</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-2.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Tahun Ajaran</span>
                <span className="text-[10px] text-cyan-400 font-normal">Pilih Tahun Ajaran</span>
              </label>
              <div className="relative group">
                <Calendar className="w-4 h-4 absolute left-3.5 top-2.5 text-cyan-500 group-focus-within:text-cyan-300 transition" />
                <select
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-blue-900/50 bg-[#060a14]/90 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-400 transition shadow-inner appearance-none cursor-pointer"
                >
                  <option value="2023/2024" className="bg-[#090e1d] text-white">2023/2024</option>
                  <option value="2024/2025" className="bg-[#090e1d] text-white">2024/2025</option>
                  <option value="2025/2026" className="bg-[#090e1d] text-white">2025/2026</option>
                  <option value="2026/2027" className="bg-[#090e1d] text-white">2026/2027</option>
                  <option value="2027/2028" className="bg-[#090e1d] text-white">2027/2028</option>
                  <option value="2028/2029" className="bg-[#090e1d] text-white">2028/2029</option>
                  <option value="2029/2030" className="bg-[#090e1d] text-white">2029/2030</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-2.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">Username</label>
              <div className="relative group">
                <User className="w-4 h-4 absolute left-3.5 top-2.5 text-cyan-500 group-focus-within:text-cyan-300 transition" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-900/50 bg-[#060a14]/90 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-400 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-cyan-500 group-focus-within:text-cyan-300 transition" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Kata Sandi..."
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-blue-900/50 bg-[#060a14]/90 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-400 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-cyan-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 transition">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-blue-900/80 bg-[#060a14] text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Ingat saya di perangkat ini</span>
              </label>
              <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> Siap Digunakan
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/40 hover:shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all duration-300 active:scale-98 cursor-pointer mt-1"
            >
              <span>MASUK KE SISTEM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-2.5 px-4 text-center text-[11px] text-slate-500 border-t border-blue-900/30 bg-[#040711]/80 backdrop-blur-md relative z-20 flex-shrink-0">
        © 2026 SMP NEGERI 18 JAKARTA. All rights reserved.
      </footer>
    </div>
  );
};
