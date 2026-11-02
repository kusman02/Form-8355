import * as XLSX from 'xlsx';
import { Student, WaliKelas } from '../types';

export function calculateAge(birthDateStr: string, referenceDateStr: string = '2026-10-30') {
  if (!birthDateStr) return { years: 0, months: 0, str: '-', category: '13 THN' };
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return { years: 0, months: 0, str: '-', category: '13 THN' };

  const today = new Date(referenceDateStr);
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  let category = '13 THN';
  if (years < 12) category = '< 12 THN';
  else if (years === 12) category = '12 THN';
  else if (years === 13) category = '13 THN';
  else if (years === 14) category = '14 THN';
  else if (years >= 15) category = '>= 15 THN';

  return {
    years,
    months,
    str: `${years} THN ${months} BLN`,
    category
  };
}

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '30 Oktober 2026';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function exportStudentsToExcel(students: Student[], rombelFilter: string = '') {
  const filterLabel = rombelFilter ? `KELAS_${rombelFilter.replace(/\s+/g, '_')}` : 'Semua_Kelas';
  const data = students.map((s, idx) => ({
    "NO": idx + 1,
    "NAMA PESERTA DIDIK": s.nama,
    "KELAS": s.rombel,
    "NIS": s.nis,
    "NISN": s.nisn,
    "JENIS KELAMIN (L/P)": s.gender,
    "TEMPAT LAHIR": s.tempatLahir,
    "TANGGAL LAHIR (YYYY-MM-DD)": s.birthDate,
    "AGAMA": s.agama,
    "NAMA ORANG TUA": s.ortu,
    "ALAMAT LENGKAP": s.alamat
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 10 },
    { wch: 12 },
    { wch: 16 },
    { wch: 10 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 25 },
    { wch: 45 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Siswa");
  XLSX.writeFile(wb, `Master_Data_Siswa_${filterLabel}_SMPN18.xlsx`);
}

export function downloadStudentTemplate() {
  const sample = [
    {
      "NAMA PESERTA DIDIK": "CONTOH SISWA BARU",
      "KELAS": "VII-A",
      "NIS": "1099",
      "NISN": "0109988776",
      "JENIS KELAMIN (L/P)": "L",
      "TEMPAT LAHIR": "JAKARTA",
      "TANGGAL LAHIR (YYYY-MM-DD)": "2013-06-15",
      "AGAMA": "ISLAM",
      "NAMA ORANG TUA": "NAMA WALI SISWA",
      "ALAMAT LENGKAP": "JL. MENTENG RAYA NO. 1"
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
  XLSX.writeFile(wb, "Template_Import_Siswa_SMPN18.xlsx");
}

export function exportWaliKelasToExcel(waliList: WaliKelas[]) {
  const data = waliList.map((w, idx) => ({
    "NO": idx + 1,
    "ROMBEL / KELAS": w.rombel,
    "NAMA WALI KELAS": w.nama,
    "NIP WALI KELAS": w.nip || "-"
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 35 },
    { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Wali Kelas");
  XLSX.writeFile(wb, "Data_Wali_Kelas_SMPN18.xlsx");
}

export function downloadWaliTemplate() {
  const sample = [
    {
      "ROMBEL / KELAS": "KELAS VII-A",
      "NAMA WALI KELAS": "Dra. Hj. Siti Marwiyah, M.Pd.",
      "NIP WALI KELAS": "196804151994122001"
    },
    {
      "ROMBEL / KELAS": "KELAS VII-B",
      "NAMA WALI KELAS": "Bambang Sutejo, S.Pd.",
      "NIP WALI KELAS": "197405202000031002"
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Wali Kelas");
  XLSX.writeFile(wb, "Template_Wali_Kelas_SMPN18.xlsx");
}
