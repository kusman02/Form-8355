import { Student, WaliKelas, UserAccount, Mutasi, SchoolProfile, Officials, LogoConfig } from '../types';

export const initialSchoolProfile: SchoolProfile = {
  instansiAtas: "",
  dinas: "",
  name: "",
  npsn: "",
  address: ""
};

export const initialOfficials: Officials = {
  kepsekName: "",
  kepsekNip: "",
  pengawasName: "",
  pengawasNip: "",
  kepsekTtdUrl: "",
  pengawasTtdUrl: ""
};

export const initialLogoConfig: LogoConfig = {
  instansiLogoUrl: "",
  sekolahLogoUrl: "",
  sidebarLogoUrl: "",
  sidebarTextName: "SMPN 18 JAKARTA"
};

export const initialUsers: UserAccount[] = [
  {
    id: 1,
    nama: "Nuryaman, S.Kom.",
    email: "admin@smpn18.sch.id",
    username: "123",
    password: "123",
    role: "Admin",
    info: "Operator Utama Sistem Data 8355"
  },
  {
    id: 2,
    nama: "Drs. H. Sukirman, M.Pd.",
    email: "kepsek@smpn18.sch.id",
    username: "kepsek",
    password: "123",
    role: "Kepala Sekolah",
    info: "Kepala SMPN 18 Jakarta"
  },
  {
    id: 3,
    nama: "Dra. Hj. Siti Marwiyah, M.Pd.",
    email: "marwiyah@smpn18.sch.id",
    username: "guru",
    password: "123",
    role: "Guru",
    info: "Wali Kelas VII-A"
  }
];

export const initialWaliKelas: WaliKelas[] = [
  { id: 1, rombel: "KELAS VII-A", nama: "Dra. Hj. Siti Marwiyah, M.Pd.", nip: "196804151994122001" },
  { id: 2, rombel: "KELAS VII-B", nama: "Bambang Sutejo, S.Pd.", nip: "197405202000031002" },
  { id: 3, rombel: "KELAS VII-C", nama: "Ratna Dewi, S.Pd.", nip: "198203112008012015" },
  { id: 4, rombel: "KELAS VIII-A", nama: "Drs. Hendro Wibowo", nip: "196511021992031004" },
  { id: 5, rombel: "KELAS VIII-B", nama: "Sri Wahyuni, M.Si.", nip: "197908142006042021" },
  { id: 6, rombel: "KELAS IX-A", nama: "Ahmad Fauzan, S.Pd.", nip: "198501252010011018" }
];

export const initialStudents: Student[] = [
  { id: 1, nis: "1001", nisn: "0101234567", nama: "AHMAD FAUZI ALAMSYAH", gender: "L", rombel: "VII-A", tempatLahir: "JAKARTA", birthDate: "2013-05-12", ttl: "JAKARTA, 12 MEI 2013", agama: "ISLAM", ortu: "BUDI SANTOSO", alamat: "JL. MENTENG RAYA NO. 10, JAKARTA PUSAT" },
  { id: 2, nis: "1002", nisn: "0107654321", nama: "SITI RAHMA AZZAHRA", gender: "P", rombel: "VII-A", tempatLahir: "JAKARTA", birthDate: "2013-08-20", ttl: "JAKARTA, 20 AGUSTUS 2013", agama: "ISLAM", ortu: "AHMAD HIDAYAT", alamat: "JL. KEBON SIRIH NO. 45, JAKARTA PUSAT" },
  { id: 3, nis: "1003", nisn: "0109876543", nama: "DIMAS ARYA PRATAMA", gender: "L", rombel: "VII-A", tempatLahir: "BEKASI", birthDate: "2013-03-15", ttl: "BEKASI, 15 MARET 2013", agama: "ISLAM", ortu: "SURYA WIJAYA", alamat: "JL. CIKINI RAYA NO. 12, JAKARTA PUSAT" },
  { id: 4, nis: "1004", nisn: "0103456789", nama: "ANNISA NUR AINI", gender: "P", rombel: "VII-A", tempatLahir: "JAKARTA", birthDate: "2013-11-05", ttl: "JAKARTA, 5 NOVEMBER 2013", agama: "ISLAM", ortu: "HENDRA KUSUMA", alamat: "JL. KRAMAT RAYA NO. 88, JAKARTA PUSAT" },
  { id: 5, nis: "1005", nisn: "0134598124", nama: "RIZKY PRATAMA KUSUMA", gender: "L", rombel: "VII-B", tempatLahir: "JAKARTA", birthDate: "2013-05-14", ttl: "JAKARTA, 14 MEI 2013", agama: "ISLAM", ortu: "KUSUMA WARDANA", alamat: "JL. MENTENG TENGGULUN NO. 12, JAKARTA PUSAT" },
  { id: 6, nis: "1006", nisn: "0105432167", nama: "NABILA PUTRI SALSABILA", gender: "P", rombel: "VII-B", tempatLahir: "BOGOR", birthDate: "2013-07-25", ttl: "BOGOR, 25 JULI 2013", agama: "ISLAM", ortu: "RIDWAN HAKIM", alamat: "JL. SALEMBA TENGAH NO. 23, JAKARTA PUSAT" },
  { id: 7, nis: "1007", nisn: "0106543218", nama: "MUHAMMAD FADHLI ILHAM", gender: "L", rombel: "VII-B", tempatLahir: "JAKARTA", birthDate: "2013-02-18", ttl: "JAKARTA, 18 FEBRUARI 2013", agama: "ISLAM", ortu: "ILHAM MAULANA", alamat: "JL. PEGANGSAAN TIMUR NO. 5, JAKARTA PUSAT" },
  { id: 8, nis: "1008", nisn: "0108765432", nama: "CHELSEA OLIVIA WIJAYA", gender: "P", rombel: "VII-C", tempatLahir: "JAKARTA", birthDate: "2013-09-30", ttl: "JAKARTA, 30 SEPTEMBER 2013", agama: "KRISTEN", ortu: "DAVID WIJAYA", alamat: "JL. CEMPAKA PUTIH BARAT NO. 14, JAKARTA PUSAT" },
  { id: 9, nis: "1009", nisn: "0102345678", nama: "BAGAS SATRIA DEWANTARA", gender: "L", rombel: "VII-C", tempatLahir: "BANDUNG", birthDate: "2013-06-10", ttl: "BANDUNG, 10 JUNI 2013", agama: "ISLAM", ortu: "AGUS DEWANTARA", alamat: "JL. MENTENG KECIL NO. 19, JAKARTA PUSAT" },
  { id: 10, nis: "1010", nisn: "0104321654", nama: "ZAHRA ALYA KHAIRUNNISA", gender: "P", rombel: "VIII-A", tempatLahir: "JAKARTA", birthDate: "2012-04-14", ttl: "JAKARTA, 14 APRIL 2012", agama: "ISLAM", ortu: "FERRY IRAWAN", alamat: "JL. JOHAR BARU UTARA NO. 7, JAKARTA PUSAT" },
  { id: 11, nis: "1011", nisn: "0108901234", nama: "FAJAR ADITYA RAMADHAN", gender: "L", rombel: "VIII-A", tempatLahir: "JAKARTA", birthDate: "2012-08-01", ttl: "JAKARTA, 1 AGUSTUS 2012", agama: "ISLAM", ortu: "BAMBANG RAMADHAN", alamat: "JL. RAWASARI TIMUR NO. 30, JAKARTA PUSAT" },
  { id: 12, nis: "1012", nisn: "0107890123", nama: "KEISHA NAURAH MAHARANI", gender: "P", rombel: "VIII-B", tempatLahir: "TANGERANG", birthDate: "2012-10-18", ttl: "TANGERANG, 18 OKTOBER 2012", agama: "ISLAM", ortu: "DEDY MAHARDIKA", alamat: "JL. PERCETAKAN NEGARA NO. 52, JAKARTA PUSAT" },
  { id: 13, nis: "1013", nisn: "0109012345", nama: "JONATHAN KEVIN SIMANJUNTAK", gender: "L", rombel: "VIII-B", tempatLahir: "MEDAN", birthDate: "2012-12-05", ttl: "MEDAN, 5 DESEMBER 2012", agama: "KRISTEN", ortu: "T. SIMANJUNTAK", alamat: "JL. KRAMAT SENTIONG NO. 16, JAKARTA PUSAT" },
  { id: 14, nis: "1014", nisn: "0103214567", nama: "NURUL AINI SALSABILA", gender: "P", rombel: "IX-A", tempatLahir: "JAKARTA", birthDate: "2011-01-20", ttl: "JAKARTA, 20 JANUARI 2011", agama: "ISLAM", ortu: "AAN KURNIAWAN", alamat: "JL. PASEBAN RAYA NO. 8, JAKARTA PUSAT" },
  { id: 15, nis: "1015", nisn: "0106549871", nama: "REZA SAPUTRA HASIBUAN", gender: "L", rombel: "IX-A", tempatLahir: "PADANG", birthDate: "2011-09-11", ttl: "PADANG, 11 SEPTEMBER 2011", agama: "ISLAM", ortu: "SAPUTRA HASIBUAN", alamat: "JL. TAMBAK NO. 21, JAKARTA PUSAT" }
];

export const initialMutasi: Mutasi[] = [
  {
    id: 1,
    tanggal: "2026-08-10",
    nama: "DANANG PRASETYO",
    rombel: "VII-A",
    nis: "1016",
    nisn: "0103348123",
    gender: "L",
    jenis: "MASUK",
    sekolah: "SMPN 1 Bandung",
    alasan: "Pindah Domisili Mengikuti Tugas Orang Tua",
    noSurat: "Surat: 421.3/089/SMPN1-BDG/2026"
  },
  {
    id: 2,
    tanggal: "2026-08-25",
    nama: "ALIF KURNIAWAN",
    rombel: "VII-A",
    nis: "0988",
    nisn: "0098877112",
    gender: "L",
    jenis: "KELUAR",
    sekolah: "SMPN 2 Semarang",
    alasan: "Pindah Rumah ke Luar Kota",
    noSurat: "Surat: 421.3/102/SMPN18-JKT/2026"
  }
];

export const defaultRombels = [
  "VII-A",
  "VII-B",
  "VII-C",
  "VIII-A",
  "VIII-B",
  "IX-A"
];
