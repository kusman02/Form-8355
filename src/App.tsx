import { useState, useEffect } from 'react';
import {
  Student,
  WaliKelas,
  UserAccount,
  Mutasi,
  SchoolProfile,
  Officials,
  LogoConfig,
  ActiveView
} from './types';
import {
  initialSchoolProfile,
  initialOfficials,
  initialLogoConfig,
  initialUsers,
  initialWaliKelas,
  initialStudents,
  initialMutasi,
  defaultRombels
} from './data/initialData';
import {
  getStoredTahunAjaran,
  setStoredTahunAjaran,
  getStoredSignatureLocationDate,
  setStoredSignatureLocationDate,
  isElectronApp,
  syncCollectionToDatabase
} from './utils/electronBridge';

// Views
import { LoginView } from './views/LoginView';
import { RekapitulasiView } from './views/RekapitulasiView';
import { KategoriUsiaView } from './views/KategoriUsiaView';
import { ProfilSekolahView } from './views/ProfilSekolahView';
import { TahunAjaranView } from './views/TahunAjaranView';
import { UploadLogoView } from './views/UploadLogoView';
import { PejabatWaliView } from './views/PejabatWaliView';
import { DataPenggunaView } from './views/DataPenggunaView';
import { DatabaseDesktopView } from './views/DatabaseDesktopView';
import { MasterSiswaView } from './views/MasterSiswaView';
import { Form8355CetakView } from './views/Form8355CetakView';
import { DaftarSiswaView } from './views/DaftarSiswaView';
import { DaftarAbsenView } from './views/DaftarAbsenView';
import { DaftarMutasiView } from './views/DaftarMutasiView';

// Modals
import { StudentModal } from './components/StudentModal';
import { WaliKelasModal } from './components/WaliKelasModal';
import { UserModal } from './components/UserModal';
import { MutasiModal } from './components/MutasiModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SchoolLogo, UserAvatar } from './components/BrandLogos';

// Icons
import {
  LayoutGrid,
  ChevronDown,
  UsersRound,
  PieChart,
  Settings,
  School,
  Image,
  UserCheck,
  Users,
  FileSpreadsheet,
  Database,
  Printer,
  UserCog,
  CalendarCheck,
  ArrowLeftRight,
  RotateCw,
  LogOut,
  Moon,
  Sun,
  Calendar,
  CheckCircle,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // State: Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('smpn18_dark_mode') === 'true';
  });

  // State: Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  // State: Core App Data with LocalStorage Persistence
  const [school, setSchool] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('smpn18_schoolProfile_v2');
    const baseProfile: SchoolProfile = saved ? JSON.parse(saved) : initialSchoolProfile;
    const titimangsa = getStoredSignatureLocationDate(baseProfile.tempat || 'Jakarta', baseProfile.tanggal || '30 Oktober 2026');
    return {
      ...baseProfile,
      tempat: baseProfile.tempat || titimangsa.tempat,
      tanggal: baseProfile.tanggal || titimangsa.tanggal
    };
  });

  const [officials, setOfficials] = useState<Officials>(() => {
    const saved = localStorage.getItem('smpn18_officials_v2');
    return saved ? JSON.parse(saved) : initialOfficials;
  });

  const [logos, setLogos] = useState<LogoConfig>(() => {
    const saved = localStorage.getItem('smpn18_logos');
    return saved ? JSON.parse(saved) : initialLogoConfig;
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('smpn18_userAccounts');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [waliList, setWaliList] = useState<WaliKelas[]>(() => {
    const saved = localStorage.getItem('smpn18_waliList');
    return saved ? JSON.parse(saved) : initialWaliKelas;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smpn18_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [mutasiList, setMutasiList] = useState<Mutasi[]>(() => {
    const saved = localStorage.getItem('smpn18_mutasiList');
    return saved ? JSON.parse(saved) : initialMutasi;
  });

  // State: Tahun Ajaran / Pelajaran with Electron & Web persistence
  const [tahunAjaran, setTahunAjaran] = useState<string>(() => {
    return getStoredTahunAjaran('2026/2027');
  });

  // Authentication & Active User
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Active View & Accordions
  const [activeView, setActiveView] = useState<ActiveView>('view-rekapitulasi');
  const [accDashboard, setAccDashboard] = useState<boolean>(true);
  const [accPengaturan, setAccPengaturan] = useState<boolean>(true);
  const [acc8355, setAcc8355] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  // Modals
  const [studentModal, setStudentModal] = useState<{ isOpen: boolean; student: Student | null }>({
    isOpen: false,
    student: null
  });
  const [waliModal, setWaliModal] = useState<{ isOpen: boolean; wali: WaliKelas | null }>({
    isOpen: false,
    wali: null
  });
  const [userModal, setUserModal] = useState<{ isOpen: boolean; user: UserAccount | null }>({
    isOpen: false,
    user: null
  });
  const [mutasiModal, setMutasiModal] = useState<{ isOpen: boolean; mutasi: Mutasi | null }>({
    isOpen: false,
    mutasi: null
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    iconType?: 'trash' | 'logout' | 'alert';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Initial Hydration from Electron Database (if running in Electron)
  useEffect(() => {
    if (isElectronApp() && window.electronAPI?.db?.getAll) {
      window.electronAPI.db.getAll().then((data) => {
        if (data && typeof data === 'object') {
          if (data.school && typeof data.school === 'object' && Object.keys(data.school).length > 0) {
            setSchool(data.school);
          }
          if (data.officials && typeof data.officials === 'object' && Object.keys(data.officials).length > 0) {
            setOfficials(data.officials);
          }
          if (data.logos && typeof data.logos === 'object' && Object.keys(data.logos).length > 0) {
            setLogos(data.logos);
          }
          if (Array.isArray(data.userAccounts) && data.userAccounts.length > 0) {
            setUserAccounts(data.userAccounts);
          }
          if (Array.isArray(data.waliList) && data.waliList.length > 0) {
            setWaliList(data.waliList);
          }
          if (Array.isArray(data.students) && data.students.length > 0) {
            setStudents(data.students);
          }
          if (Array.isArray(data.mutasiList)) {
            setMutasiList(data.mutasiList);
          }
          if (data.tahunAjaran && typeof data.tahunAjaran === 'string') {
            setTahunAjaran(data.tahunAjaran);
          }
        }
      }).catch(err => {
        console.warn('Initial electron DB hydration error:', err);
      });
    }
  }, []);

  // Effects: Save changes to LocalStorage and Electron Native Database Engine
  useEffect(() => {
    localStorage.setItem('smpn18_schoolProfile_v2', JSON.stringify(school));
    if (school.tempat || school.tanggal) {
      setStoredSignatureLocationDate(school.tempat || 'Jakarta', school.tanggal || '30 Oktober 2026');
    }
    syncCollectionToDatabase('school', school);
  }, [school]);

  useEffect(() => {
    localStorage.setItem('smpn18_officials_v2', JSON.stringify(officials));
    syncCollectionToDatabase('officials', officials);
  }, [officials]);

  useEffect(() => {
    localStorage.setItem('smpn18_logos', JSON.stringify(logos));
    syncCollectionToDatabase('logos', logos);
  }, [logos]);

  useEffect(() => {
    localStorage.setItem('smpn18_userAccounts', JSON.stringify(userAccounts));
    syncCollectionToDatabase('userAccounts', userAccounts);
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('smpn18_waliList', JSON.stringify(waliList));
    syncCollectionToDatabase('waliList', waliList);
  }, [waliList]);

  useEffect(() => {
    localStorage.setItem('smpn18_students', JSON.stringify(students));
    syncCollectionToDatabase('students', students);
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smpn18_mutasiList', JSON.stringify(mutasiList));
    syncCollectionToDatabase('mutasiList', mutasiList);
  }, [mutasiList]);

  useEffect(() => {
    setStoredTahunAjaran(tahunAjaran);
    syncCollectionToDatabase('tahunAjaran', tahunAjaran);
  }, [tahunAjaran]);

  useEffect(() => {
    localStorage.setItem('smpn18_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check saved session on load
  useEffect(() => {
    const savedUserId = localStorage.getItem('smpn18_saved_user_id');
    if (savedUserId) {
      const found = userAccounts.find(u => String(u.id) === String(savedUserId));
      if (found) {
        setCurrentUser(found);
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Ensure role permissions are enforced
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    if (!isAdmin && isLoggedIn) {
      const restrictedViews: ActiveView[] = [
        'view-profil-sekolah',
        'view-tahun-ajaran',
        'view-upload-logo',
        'view-input-penjabat',
        'view-data-pengguna',
        'view-database-desktop',
        'view-master-siswa'
      ];
      if (restrictedViews.includes(activeView)) {
        setActiveView('view-rekapitulasi');
      }
    }
  }, [currentUser, activeView, isAdmin, isLoggedIn]);

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Logout with custom ConfirmModal
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Keluar Sistem",
      message: `Apakah Anda yakin ingin keluar dari sistem aplikasi SMP Negeri 18 Jakarta, ${currentUser?.nama || ''}?`,
      confirmText: "Ya, Keluar",
      variant: "warning",
      iconType: "logout",
      onConfirm: () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        localStorage.removeItem('smpn18_saved_user_id');
        showToast("Anda telah keluar dari sistem.");
      }
    });
  };

  // Student CRUD
  const handleSaveStudent = (studentData: Omit<Student, 'id'> & { id?: string | number }) => {
    if (studentData.id) {
      setStudents(prev => prev.map(s => String(s.id) === String(studentData.id) ? { ...s, ...studentData } as Student : s));
      showToast("Data peserta didik berhasil diperbarui!");
    } else {
      const newStudent: Student = {
        ...studentData,
        id: Date.now()
      } as Student;
      setStudents(prev => [newStudent, ...prev]);
      showToast("Peserta didik baru berhasil ditambahkan!");
    }
  };

  const handleDeleteStudent = (id: string | number) => {
    const target = students.find(s => String(s.id) === String(id));
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Peserta Didik",
      message: `Apakah Anda yakin ingin menghapus data peserta didik "${target?.nama || ''}" dari Buku Induk Form 8355?`,
      confirmText: "Hapus Siswa",
      variant: "danger",
      iconType: "trash",
      onConfirm: () => {
        setStudents(prev => prev.filter(s => String(s.id) !== String(id)));
        showToast("Peserta didik berhasil dihapus dari Buku Induk.");
      }
    });
  };

  const handleDeleteAllStudents = () => {
    if (students.length === 0) {
      showToast("Data peserta didik sudah kosong.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Semua Data Siswa",
      message: `PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH data peserta didik (${students.length} siswa) dari Master Data Buku Induk Form 8355? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus Semua Siswa",
      cancelText: "Batal",
      variant: "danger",
      iconType: "trash",
      onConfirm: () => {
        const totalDeleted = students.length;
        setStudents([]);
        localStorage.setItem('smpn18_students', JSON.stringify([]));
        showToast(`Seluruh data peserta didik (${totalDeleted} siswa) berhasil dihapus.`);
      }
    });
  };

  const handleImportStudents = (imported: Student[]) => {
    setStudents(prev => {
      // Merge unique by NIS or NISN
      const existingNis = new Set(prev.map(s => s.nis).filter(Boolean));
      const filteredNew = imported.filter(i => !i.nis || !existingNis.has(i.nis));
      return [...filteredNew, ...prev];
    });
  };

  // Wali Kelas CRUD
  const handleSaveWali = (waliData: Omit<WaliKelas, 'id'> & { id?: string | number }) => {
    if (waliData.id) {
      setWaliList(prev => prev.map(w => String(w.id) === String(waliData.id) ? { ...w, ...waliData } as WaliKelas : w));
      showToast("Data Wali Kelas berhasil diperbarui!");
    } else {
      const newWali: WaliKelas = {
        ...waliData,
        id: Date.now()
      } as WaliKelas;
      setWaliList(prev => [...prev, newWali]);
      showToast("Wali Kelas baru berhasil ditambahkan!");
    }
  };

  const handleDeleteWali = (id: string | number) => {
    const target = waliList.find(w => String(w.id) === String(id));
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Wali Kelas",
      message: `Apakah Anda yakin ingin menghapus data Wali Kelas "${target?.rombel || ''}" (${target?.nama || ''})?`,
      confirmText: "Hapus Wali Kelas",
      variant: "danger",
      iconType: "trash",
      onConfirm: () => {
        setWaliList(prev => prev.filter(w => String(w.id) !== String(id)));
        showToast("Data Wali Kelas berhasil dihapus.");
      }
    });
  };

  // User Accounts CRUD
  const handleSaveUser = (userData: Omit<UserAccount, 'id'> & { id?: string | number }) => {
    if (userData.id) {
      setUserAccounts(prev => prev.map(u => String(u.id) === String(userData.id) ? { ...u, ...userData } as UserAccount : u));
      if (currentUser && String(currentUser.id) === String(userData.id)) {
        setCurrentUser({ ...currentUser, ...userData } as UserAccount);
      }
      showToast("Data pengguna berhasil diperbarui!");
    } else {
      const newUser: UserAccount = {
        ...userData,
        id: Date.now()
      } as UserAccount;
      setUserAccounts(prev => [...prev, newUser]);
      showToast("Pengguna baru berhasil ditambahkan!");
    }
  };

  const handleDeleteUser = (id: string | number) => {
    if (userAccounts.length <= 1) {
      showToast("Sistem memerlukan minimal 1 akun pengguna aktif.");
      return;
    }
    const targetUser = userAccounts.find(u => String(u.id) === String(id));
    const isCurrent = currentUser && String(currentUser.id) === String(id);

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Pengguna",
      message: isCurrent
        ? `Perhatian: Anda sedang menghapus akun yang sedang Anda gunakan saat ini ("${targetUser?.nama || targetUser?.username}"). Jika akun ini dihapus, Anda akan otomatis dialihkan ke layar login.`
        : `Apakah Anda yakin ingin menghapus akun pengguna "${targetUser?.nama || targetUser?.username}" (${targetUser?.role})?`,
      confirmText: "Hapus Pengguna",
      variant: "danger",
      iconType: "trash",
      onConfirm: () => {
        setUserAccounts(prev => prev.filter(u => String(u.id) !== String(id)));
        if (isCurrent) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          localStorage.removeItem('smpn18_saved_user_id');
          showToast("Akun Anda telah dihapus. Silakan login kembali dengan akun lain.");
        } else {
          showToast("Akun pengguna berhasil dihapus.");
        }
      }
    });
  };

  // Mutasi CRUD
  const handleSaveMutasi = (mutasiData: Omit<Mutasi, 'id'> & { id?: string | number }, syncMaster: boolean) => {
    if (mutasiData.id) {
      setMutasiList(prev => prev.map(m => String(m.id) === String(mutasiData.id) ? { ...m, ...mutasiData } as Mutasi : m));
      showToast("Data mutasi berhasil diperbarui!");
    } else {
      const newMutasi: Mutasi = {
        ...mutasiData,
        id: Date.now()
      } as Mutasi;
      setMutasiList(prev => [newMutasi, ...prev]);

      // If mutasi MASUK and user checked sync, add to students list
      if (syncMaster && mutasiData.jenis === 'MASUK') {
        const studentObj: Student = {
          id: Date.now() + 1,
          nama: mutasiData.nama,
          rombel: mutasiData.rombel,
          nis: mutasiData.nis || `10${Math.floor(10 + Math.random() * 89)}`,
          nisn: mutasiData.nisn || `010${Math.floor(1000000 + Math.random() * 8999999)}`,
          gender: mutasiData.gender,
          tempatLahir: 'JAKARTA',
          birthDate: '2013-05-15',
          agama: 'ISLAM',
          ortu: 'ORANG TUA SISWA',
          alamat: 'JL. MENTENG, JAKARTA PUSAT'
        };
        setStudents(prev => [studentObj, ...prev]);
        showToast("Mutasi tercatat & siswa otomatis ditambahkan ke Master Data!");
      } else {
        showToast("Catatan mutasi berhasil disimpan!");
      }
    }
  };

  const handleDeleteMutasi = (id: string | number) => {
    const target = mutasiList.find(m => String(m.id) === String(id));
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Catatan Mutasi",
      message: `Apakah Anda yakin ingin menghapus catatan mutasi siswa "${target?.nama || ''}" (${target?.jenis})?`,
      confirmText: "Hapus Mutasi",
      variant: "danger",
      iconType: "trash",
      onConfirm: () => {
        setMutasiList(prev => prev.filter(m => String(m.id) !== String(id)));
        showToast("Catatan mutasi berhasil dihapus.");
      }
    });
  };

  // View Title and Subtitle Mapping
  const viewHeaders: Record<ActiveView, { title: string; subtitle: string }> = {
    'view-rekapitulasi': {
      title: 'Rekapitulasi Siswa L/P Per Kelas',
      subtitle: 'Rekapitulasi jumlah siswa laki-laki dan perempuan di setiap rombongan belajar'
    },
    'view-kategori-usia': {
      title: 'Kategori Nama & Usia Siswa',
      subtitle: 'Distribusi dan rincian data siswa berdasarkan kelompok kategori usia'
    },
    'view-profil-sekolah': {
      title: 'Profil Sekolah & Kustomisasi Header Kop',
      subtitle: 'Atur identitas lembaga yang akan dicetak di semua formulir resmi'
    },
    'view-tahun-ajaran': {
      title: 'Pengaturan Tahun Ajaran / Pelajaran',
      subtitle: 'Kelola dan tentukan tahun pelajaran aktif yang berlaku untuk seluruh formulir cetak dan buku induk'
    },
    'view-upload-logo': {
      title: 'Pengaturan Logo Dokumen & Identitas Sidebar',
      subtitle: 'Unggah logo kustom untuk kop surat resmi F4 dan navigasi samping'
    },
    'view-input-penjabat': {
      title: 'Input Data Pejabat & Pengesah Dokumen',
      subtitle: 'Data Kepala Sekolah, Pengawas Pembina, Wali Kelas, serta tanda tangan digital'
    },
    'view-data-pengguna': {
      title: 'Data Pengguna Aplikasi Form 8355',
      subtitle: 'Manajemen akun pengguna dan otorisasi akses sistem'
    },
    'view-database-desktop': {
      title: 'Pusat Manajemen Database & Backup Desktop',
      subtitle: 'Penyimpanan berkas offline, pencadangan otomatis, dan pemulihan data'
    },
    'view-master-siswa': {
      title: 'Master Data Siswa (Buku Induk Form 8355)',
      subtitle: 'Kelola basis data siswa lengkap dengan impor/ekspor Excel'
    },
    'view-form-8355-cetak': {
      title: 'Form 8355 Cetak (Landscape F4)',
      subtitle: 'Format resmi cetak formulir 8355 lengkap dengan lembar lanjutan dan legalitas pengesahan'
    },
    'view-daftar-siswa': {
      title: 'Daftar Siswa Sekolah (Format 36 Baris F4)',
      subtitle: 'Kartu informasi dan rincian profil peserta didik resmi per rombel'
    },
    'view-daftar-absen': {
      title: 'Daftar Absensi Peserta Didik',
      subtitle: 'Pencatatan presensi kehadiran siswa harian format 2 lembar F4 Landscape'
    },
    'view-daftar-mutasi': {
      title: 'Daftar Mutasi Siswa & Rekapitulasi Perhitungan',
      subtitle: 'Pencatatan resmi mutasi siswa masuk dan keluar beserta perhitungan saldo'
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginView
          userAccounts={userAccounts}
          npsn={school.npsn}
          defaultTahunAjaran={tahunAjaran}
          logos={logos}
          schoolName={logos.sidebarTextName || school.name}
          onLoginSuccess={(account, selectedTahunAjaran) => {
            setCurrentUser(account);
            if (selectedTahunAjaran) {
              setTahunAjaran(selectedTahunAjaran);
            }
            setIsLoggedIn(true);
          }}
          showToast={showToast}
        />
        {/* Toast Notification */}
        <div
          className={`fixed bottom-5 right-5 z-50 transition-all duration-300 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold ${
            toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGASI */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#090d16] text-slate-300 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out select-none border-r border-slate-800/60 no-print lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-500/40 text-white font-bold flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden p-1 flex-shrink-0">
              <SchoolLogo
                url={logos.sidebarLogoUrl || logos.sekolahLogoUrl}
                alt={logos.sidebarTextName || school.name}
                className="w-full h-full object-contain"
                fallbackClassName="w-full h-full"
              />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-base leading-tight truncate">
                {logos.sidebarTextName || school.name || 'SMPN 18 JAKARTA'}
              </h1>
              <p className="text-xs text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Sistem Data Form 8355</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Section 1: NAVIGASI UTAMA */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              NAVIGASI UTAMA
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAccDashboard(!accDashboard)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeView === 'view-rekapitulasi' || activeView === 'view-kategori-usia'
                    ? 'text-sky-300 bg-sky-950/40 border border-sky-500/30'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className={`w-4 h-4 ${activeView === 'view-rekapitulasi' || activeView === 'view-kategori-usia' ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accDashboard ? 'rotate-180' : ''}`} />
              </button>
              {accDashboard && (
                <div className="pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => navigateTo('view-rekapitulasi')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                      activeView === 'view-rekapitulasi'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <UsersRound className="w-3.5 h-3.5" />
                    <span>Rekapitulasi L/P Per Kelas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('view-kategori-usia')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                      activeView === 'view-kategori-usia'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>Kategori Nama & Usia</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: PENGATURAN (Admin Only) */}
          {isAdmin && (
            <div>
              <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                PENGATURAN
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setAccPengaturan(!accPengaturan)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeView === 'view-profil-sekolah' || activeView === 'view-tahun-ajaran' || activeView === 'view-upload-logo' || activeView === 'view-input-penjabat' || activeView === 'view-data-pengguna' || activeView === 'view-database-desktop'
                      ? 'text-sky-300 bg-sky-950/40 border border-sky-500/30'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`w-4 h-4 ${
                      activeView === 'view-profil-sekolah' || activeView === 'view-tahun-ajaran' || activeView === 'view-upload-logo' || activeView === 'view-input-penjabat' || activeView === 'view-data-pengguna' || activeView === 'view-database-desktop'
                        ? 'text-sky-400'
                        : 'text-slate-400'
                    }`} />
                    <span>Pengaturan</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accPengaturan ? 'rotate-180' : ''}`} />
                </button>
                {accPengaturan && (
                  <div className="pl-4 space-y-1">
                    <button
                      type="button"
                      onClick={() => navigateTo('view-profil-sekolah')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-profil-sekolah'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <School className="w-3.5 h-3.5" />
                      <span>Profil Sekolah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('view-tahun-ajaran')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-tahun-ajaran'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Tahun Ajaran</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('view-upload-logo')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-upload-logo'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('view-input-penjabat')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-input-penjabat'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Input Data Pejabat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('view-data-pengguna')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-data-pengguna'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Data Pengguna</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('view-database-desktop')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-database-desktop'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Database & Backup</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: FORMAT 8355 */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              FORMAT 8355
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAcc8355(!acc8355)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeView === 'view-master-siswa' || activeView === 'view-form-8355-cetak'
                    ? 'text-sky-300 bg-sky-950/40 border border-sky-500/30'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className={`w-4 h-4 ${
                    activeView === 'view-master-siswa' || activeView === 'view-form-8355-cetak'
                      ? 'text-sky-400'
                      : 'text-slate-400'
                  }`} />
                  <span>Format 8355</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${acc8355 ? 'rotate-180' : ''}`} />
              </button>
              {acc8355 && (
                <div className="pl-4 space-y-1">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigateTo('view-master-siswa')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                        activeView === 'view-master-siswa'
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Master Data Siswa</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateTo('view-form-8355-cetak')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                      activeView === 'view-form-8355-cetak'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Form 8355 Cetak</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: MENU LAINNYA */}
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => navigateTo('view-daftar-siswa')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                activeView === 'view-daftar-siswa'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <UserCog className={`w-4 h-4 ${activeView === 'view-daftar-siswa' ? 'text-white' : 'text-slate-400'}`} />
              <span>Daftar Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('view-daftar-absen')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                activeView === 'view-daftar-absen'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <CalendarCheck className={`w-4 h-4 ${activeView === 'view-daftar-absen' ? 'text-white' : 'text-slate-400'}`} />
              <span>Daftar Absen</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('view-daftar-mutasi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                activeView === 'view-daftar-mutasi'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <ArrowLeftRight className={`w-4 h-4 ${activeView === 'view-daftar-mutasi' ? 'text-white' : 'text-slate-400'}`} />
              <span>Daftar Mutasi</span>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070a10] flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="relative flex-shrink-0">
              <UserAvatar
                url={currentUser?.avatarUrl}
                role={currentUser?.role}
                name={currentUser?.nama}
                size="md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070a10]" title="Akun Aktif Online"></span>
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate" title={currentUser?.nama}>
                {currentUser?.nama || 'User Pengguna'}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span>{currentUser?.role || 'Guest'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => showToast("Data sistem telah disegarkan.")}
              title="Refresh Aplikasi"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN APP CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
        
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 flex-shrink-0 no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Buka Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hidden sm:block">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-none">
                {viewHeaders[activeView]?.title || 'Sistem Data Form 8355'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {viewHeaders[activeView]?.subtitle || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tahun Pelajaran: <span className="font-bold">{tahunAjaran}</span></span>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Tema Gelap/Terang"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Account Profile Badge in Header */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
              <UserAvatar
                url={currentUser?.avatarUrl}
                role={currentUser?.role}
                name={currentUser?.nama}
                size="sm"
              />
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-slate-800 dark:text-white truncate max-w-[130px]">{currentUser?.nama}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{currentUser?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEW ROUTER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeView === 'view-rekapitulasi' && (
            <RekapitulasiView
              students={students}
              waliList={waliList}
              school={school}
              officials={officials}
              logos={logos}
              tahunAjaran={tahunAjaran}
              showToast={showToast}
            />
          )}

          {activeView === 'view-kategori-usia' && (
            <KategoriUsiaView
              students={students}
              school={school}
              officials={officials}
              logos={logos}
              tahunAjaran={tahunAjaran}
              showToast={showToast}
            />
          )}

          {activeView === 'view-profil-sekolah' && isAdmin && (
            <ProfilSekolahView
              school={school}
              onSave={(updated) => {
                setSchool(updated);
                setStoredSignatureLocationDate(updated.tempat || 'Jakarta', updated.tanggal || '30 Oktober 2026');
              }}
              showToast={showToast}
              tahunAjaran={tahunAjaran}
              onSaveTahunAjaran={(newTA) => {
                setTahunAjaran(newTA);
                setStoredTahunAjaran(newTA);
                showToast(`Tahun Ajaran berhasil diubah menjadi ${newTA}`);
              }}
            />
          )}

          {activeView === 'view-tahun-ajaran' && isAdmin && (
            <TahunAjaranView
              tahunAjaran={tahunAjaran}
              onSaveTahunAjaran={(newTA) => {
                setTahunAjaran(newTA);
                setStoredTahunAjaran(newTA);
                showToast(`Tahun Ajaran berhasil diubah menjadi ${newTA}`);
              }}
              school={school}
              officials={officials}
              onSaveSchool={(updated) => {
                setSchool(updated);
                setStoredSignatureLocationDate(updated.tempat || 'Jakarta', updated.tanggal || '30 Oktober 2026');
              }}
              showToast={showToast}
            />
          )}

          {activeView === 'view-upload-logo' && isAdmin && (
            <UploadLogoView
              logos={logos}
              onSave={setLogos}
              showToast={showToast}
            />
          )}

          {activeView === 'view-input-penjabat' && isAdmin && (
            <PejabatWaliView
              officials={officials}
              waliList={waliList}
              onSaveOfficials={setOfficials}
              onOpenWaliModal={(wali) => setWaliModal({ isOpen: true, wali: wali || null })}
              onDeleteWali={handleDeleteWali}
              onImportWaliExcel={(newWalis) => {
                setWaliList(prev => [...prev, ...newWalis]);
              }}
              showToast={showToast}
            />
          )}

          {activeView === 'view-data-pengguna' && isAdmin && (
            <DataPenggunaView
              users={userAccounts}
              currentUser={currentUser}
              onOpenUserModal={(user) => setUserModal({ isOpen: true, user: user || null })}
              onDeleteUser={handleDeleteUser}
              showToast={showToast}
            />
          )}

          {activeView === 'view-database-desktop' && isAdmin && (
            <DatabaseDesktopView
              students={students}
              waliList={waliList}
              mutasiList={mutasiList}
              userAccounts={userAccounts}
              school={school}
              officials={officials}
              logos={logos}
              tahunAjaran={tahunAjaran}
              onRestoreData={(restored) => {
                if (restored.students) setStudents(restored.students);
                if (restored.waliList) setWaliList(restored.waliList);
                if (restored.mutasiList) setMutasiList(restored.mutasiList);
                if (restored.userAccounts) setUserAccounts(restored.userAccounts);
                if (restored.schoolProfile) setSchool(restored.schoolProfile);
                if (restored.officials) setOfficials(restored.officials);
                if (restored.logos) setLogos(restored.logos);
                if (restored.tahunAjaran) setTahunAjaran(restored.tahunAjaran);
                showToast("Database berhasil dipulihkan dari cadangan!");
              }}
              showToast={showToast}
            />
          )}

          {activeView === 'view-master-siswa' && isAdmin && (
            <MasterSiswaView
              students={students}
              rombelList={defaultRombels}
              onOpenAddModal={() => setStudentModal({ isOpen: true, student: null })}
              onOpenEditModal={(student) => setStudentModal({ isOpen: true, student })}
              onDeleteStudent={handleDeleteStudent}
              onDeleteAllStudents={handleDeleteAllStudents}
              onImportStudents={handleImportStudents}
              showToast={showToast}
            />
          )}

          {activeView === 'view-form-8355-cetak' && (
            <Form8355CetakView
              students={students}
              school={school}
              officials={officials}
              logos={logos}
              rombelList={defaultRombels}
              tahunAjaran={tahunAjaran}
              showToast={showToast}
            />
          )}

          {activeView === 'view-daftar-siswa' && (
            <DaftarSiswaView
              students={students}
              school={school}
              waliList={waliList}
              logos={logos}
              rombelList={defaultRombels}
              tahunAjaran={tahunAjaran}
              showToast={showToast}
            />
          )}

          {activeView === 'view-daftar-absen' && (
            <DaftarAbsenView
              students={students}
              school={school}
              waliList={waliList}
              officials={officials}
              logos={logos}
              rombelList={defaultRombels}
              tahunAjaran={tahunAjaran}
              showToast={showToast}
            />
          )}

          {activeView === 'view-daftar-mutasi' && (
            <DaftarMutasiView
              mutasiList={mutasiList}
              students={students}
              school={school}
              officials={officials}
              logos={logos}
              rombelList={defaultRombels}
              tahunAjaran={tahunAjaran}
              onOpenAddModal={() => setMutasiModal({ isOpen: true, mutasi: null })}
              onOpenEditModal={(mutasi) => setMutasiModal({ isOpen: true, mutasi })}
              onDeleteMutasi={handleDeleteMutasi}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <StudentModal
        isOpen={studentModal.isOpen}
        student={studentModal.student}
        rombelList={defaultRombels}
        onClose={() => setStudentModal({ isOpen: false, student: null })}
        onSave={handleSaveStudent}
      />

      <WaliKelasModal
        isOpen={waliModal.isOpen}
        wali={waliModal.wali}
        onClose={() => setWaliModal({ isOpen: false, wali: null })}
        onSave={handleSaveWali}
      />

      <UserModal
        isOpen={userModal.isOpen}
        user={userModal.user}
        onClose={() => setUserModal({ isOpen: false, user: null })}
        onSave={handleSaveUser}
      />

      <MutasiModal
        isOpen={mutasiModal.isOpen}
        mutasi={mutasiModal.mutasi}
        rombelList={defaultRombels}
        onClose={() => setMutasiModal({ isOpen: false, mutasi: null })}
        onSave={handleSaveMutasi}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        iconType={confirmModal.iconType}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* TOAST NOTIFICATION CONTAINER */}
      <div
        className={`fixed bottom-5 right-5 z-50 transition-all duration-300 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold no-print ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        <span>{toast.message}</span>
      </div>

    </div>
  );
}
