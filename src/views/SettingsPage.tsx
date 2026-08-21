import SettingsPanel from '../components/settings/SettingsPanel';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Kelola unit PlayStation, informasi toko, dan backup data.
      </p>
      <SettingsPanel />
    </div>
  );
}
