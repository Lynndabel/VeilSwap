type Props = { value: boolean; onChange: (v: boolean) => void }

export function PrivacyToggle({ value, onChange }: Props) {
  return ( 
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400">Privacy Mode</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          value ? 'bg-emerald-500' : 'bg-gray-600'
        }`}
        aria-pressed={value}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-xs text-gray-500">{value ? 'ON' : 'OFF'}</span>
    </div>
  )
}
