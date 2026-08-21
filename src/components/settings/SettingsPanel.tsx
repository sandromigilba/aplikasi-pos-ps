import { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function SettingsPanel() {
  const { settings, updateSettings, exportData, importData } = useStore();
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importData(file);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch {
      alert('File backup tidak valid!');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Shop Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Pengaturan Toko</h3>
            <p className="text-xs text-gray-500 font-medium">Informasi dasar dan konfigurasi aplikasi</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Toko</label>
            <input
              className="input-float w-full"
              value={settings.shopName}
              onChange={e => updateSettings({ shopName: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="glass-card p-6">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h3 className="font-bold text-gray-900">Backup & Restore Data</h3>
          <p className="text-xs mt-1 text-gray-500 font-medium">
            Unduh cadangan data JSON, atau pulihkan data dari file backup sebelumnya.
          </p>
        </div>

        {importSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
            ✅ Data berhasil dipulihkan! Halaman akan dimuat ulang.
          </div>
        )}

        <div className="flex gap-4 max-w-md">
          <button
            onClick={exportData}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Download size={18} /> Backup Data (.json)
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
          >
            <Upload size={18} /> {importing ? 'Memulihkan...' : 'Restore Data'}
          </button>

          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm max-w-md">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            <strong>Perhatian:</strong> Proses Restore akan menimpa SEMUA data yang ada di browser saat ini.
          </p>
        </div>
      </div>
    </div>
  );
}
