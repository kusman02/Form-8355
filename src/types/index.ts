export type UserRole = 'Admin' | 'Kepala Sekolah' | 'Guru';

export interface UserAccount {
  id: string | number;
  nama: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  info: string;
  avatarUrl?: string;
}

export interface Student {
  id: string | number;
  nis: string;
  nisn: string;
  nama: string;
  gender: 'L' | 'P';
  rombel: string; // e.g. 'VII-A'
  tempatLahir: string;
  birthDate: string; // YYYY-MM-DD
  ttl?: string;
  agama: string;
  ortu: string;
  alamat: string;
}

export interface WaliKelas {
  id: string | number;
  rombel: string; // e.g. 'KELAS VII-A' or 'VII-A'
  nama: string;
  nip: string;
}

export interface Mutasi {
  id: string | number;
  tanggal: string; // YYYY-MM-DD
  nama: string;
  rombel: string;
  nis: string;
  nisn: string;
  gender: 'L' | 'P';
  jenis: 'MASUK' | 'KELUAR';
  sekolah: string;
  alasan: string;
  noSurat: string;
}

export interface SchoolProfile {
  instansiAtas: string;
  dinas: string;
  name: string;
  npsn: string;
  address: string;
  tempat?: string;   // e.g. "Jakarta"
  tanggal?: string;  // e.g. "30 Oktober 2026"
}

export interface Officials {
  kepsekName: string;
  kepsekNip: string;
  pengawasName: string;
  pengawasNip: string;
  kepsekTtdUrl?: string;
  pengawasTtdUrl?: string;
}

export interface LogoConfig {
  instansiLogoUrl?: string;
  sekolahLogoUrl?: string;
  sidebarLogoUrl?: string;
  sidebarTextName: string;
}

export type ActiveView = 
  | 'view-rekapitulasi'
  | 'view-kategori-usia'
  | 'view-profil-sekolah'
  | 'view-tahun-ajaran'
  | 'view-upload-logo'
  | 'view-input-penjabat'
  | 'view-data-pengguna'
  | 'view-database-desktop'
  | 'view-master-siswa'
  | 'view-form-8355-cetak'
  | 'view-daftar-siswa'
  | 'view-daftar-absen'
  | 'view-daftar-mutasi';
