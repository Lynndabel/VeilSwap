import { ChangeEvent, useMemo, useState } from 'react'
import type { SwapToken } from '../types'
import { DEFAULT_TOKENS } from '../tokenCatalog'

type TokenSelectProps = {
  label: string
  token?: SwapToken
  onSelect: (token: SwapToken) => void
}

export function TokenSelect({ label, token, onSelect }: Readonly<TokenSelectProps>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase()
    if (!lowered) return DEFAULT_TOKENS
    return DEFAULT_TOKENS.filter((t) => t.symbol.toLowerCase().includes(lowered))
  }, [query])

  return (
    <div className="relative">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        className="mt-2 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left shadow-sm transition hover:border-white/20"
      >
        <div>
          <div className="text-sm font-semibold text-slate-100">{token?.symbol ?? 'Select token'}</div>
          <div className="text-xs text-slate-500">{token?.address ?? 'Choose from list'}</div>
        </div>
        <span className="text-xs text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-xl backdrop-blur">
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            placeholder="Search symbol"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            autoFocus
          />
          <div className="mt-3 max-h-48 space-y-1 overflow-y-auto pr-1 text-sm">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-500">
                No matches found.
              </div>
            ) : (
              filtered.map((candidate: SwapToken) => (
                <button
                  key={candidate.address}
                  type="button"
                  onClick={() => {
                    onSelect(candidate)
                    setOpen(false)
                    setQuery('')
                  }}
                  className="w-full rounded-xl border border-transparent px-3 py-2 text-left text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10"
                >
                  <div className="font-semibold">{candidate.symbol}</div>
                  <div className="text-xs text-slate-500">{candidate.address}</div>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-slate-100"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
