import React from 'react';
import { SchoolProfile, LogoConfig } from '../types';
import { SchoolEmblemSvg } from './BrandLogos';

interface KopSuratProps {
  school: SchoolProfile;
  logos: LogoConfig;
  documentTitle?: string;
  documentSubtitle?: string;
  compact?: boolean;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  school,
  logos,
  documentTitle,
  documentSubtitle,
  compact = false
}) => {
  return (
    <div className={`border-b-4 border-double border-black ${compact ? 'pb-2 mb-2' : 'pb-3 mb-4'}`}>
      <div className="flex items-center justify-between">
        {/* Left Logo: Instansi (DKI Jakarta Jaya / Custom) */}
        <div className={compact ? "w-14 flex justify-center" : "w-18 flex justify-center"}>
          {logos.instansiLogoUrl ? (
            <img 
              src={logos.instansiLogoUrl} 
              alt="Logo Instansi" 
              className={compact ? "max-h-12 max-w-full object-contain" : "max-h-16 max-w-full object-contain"} 
            />
          ) : (
            <svg className={compact ? "w-12 h-14" : "w-14 h-16"} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L90 25 V75 L50 115 L10 75 V25 Z" fill="#E53E3E" stroke="#FFD700" strokeWidth="3"/>
              <path d="M50 15 L80 32 V68 L50 100 L20 68 V32 Z" fill="#3182CE"/>
              <circle cx="50" cy="55" r="18" fill="#ECC94B"/>
              <text x="50" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A202C">JAYA</text>
            </svg>
          )}
        </div>

        {/* Center Text Information */}
        <div className="text-center flex-1 px-3">
          <h3 className={`font-bold tracking-wide uppercase leading-tight text-slate-900 ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
            {school.instansiAtas || 'PEMERINTAH DAERAH PROVINSI / KABUPATEN / KOTA'}
          </h3>
          <h4 className={`font-semibold tracking-wide uppercase leading-tight text-slate-800 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {school.dinas || 'DINAS PENDIDIKAN'}
          </h4>
          <h2 className={`font-black uppercase tracking-wider text-blue-900 leading-tight ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
            {school.name || 'NAMA SATUAN PENDIDIKAN / SEKOLAH'}
          </h2>
          <p className={`text-slate-700 font-medium leading-tight mt-0.5 ${compact ? 'text-[8.5px]' : 'text-[10px]'}`}>
            {school.address || 'Alamat Lengkap Satuan Pendidikan'} | NPSN: {school.npsn || '........'}
          </p>

          {documentTitle && (
            <div className="mt-1.5 pt-1 border-t border-slate-300">
              <h1 className={`font-black uppercase underline tracking-wider text-slate-900 ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
                {documentTitle}
              </h1>
              {documentSubtitle && (
                <p className={`font-semibold text-slate-700 ${compact ? 'text-[9.5px]' : 'text-[11px]'}`}>
                  {documentSubtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Logo: Sekolah (Official Emblem / Custom) */}
        <div className={compact ? "w-14 flex justify-center" : "w-18 flex justify-center"}>
          {logos.sekolahLogoUrl ? (
            <img 
              src={logos.sekolahLogoUrl} 
              alt="Logo Sekolah" 
              className={compact ? "max-h-12 max-w-full object-contain" : "max-h-16 max-w-full object-contain"} 
            />
          ) : (
            <div className={compact ? "w-12 h-12 flex items-center justify-center" : "w-14 h-14 flex items-center justify-center"}>
              <SchoolEmblemSvg className="w-full h-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
