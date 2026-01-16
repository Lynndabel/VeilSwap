import { ReactNode } from 'react'

export type LayoutProps = {
  headerActions?: ReactNode
  left: ReactNode
  right?: ReactNode
}

export function Layout({ headerActions, left, right }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-lg font-bold text-indigo-300">
              VS
            </span>
            <div>
              <div className="text-sm font-semibold tracking-wide text-indigo-100">VeilSwap</div>
              <div className="text-xs text-slate-400">Privacy-preserving swaps on Avalanche Fuji</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1 font-medium uppercase tracking-wide">Fuji Testnet</span>
            {headerActions}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
        <section className="flex-1">
          {left}
        </section>
        <aside className="w-full max-w-sm space-y-6 lg:w-auto">
          {right}
        </aside>
      </main>
    </div>
  )
}
