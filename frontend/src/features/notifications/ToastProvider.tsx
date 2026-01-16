import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export type Toast = {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  createdAt: number
}

export type ToastContextValue = {
  toasts: Toast[]
  pushToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

type ToastProviderProps = { readonly children: ReactNode }

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const pushToast = useCallback((toast: Omit<Toast, 'id' | 'createdAt'>) => {
    const id = createId()
    setToasts((prev) => [...prev, { ...toast, id, createdAt: Date.now() }])
    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, pushToast, dismissToast, clearToasts }),
    [clearToasts, dismissToast, pushToast, toasts]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

export function useToasts() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToasts must be used within ToastProvider')
  return ctx
}

type ToastBadgeProps = {
  readonly variant: ToastVariant
}

function ToastBadge({ variant }: ToastBadgeProps) {
  const palette: Record<ToastVariant, string> = {
    info: 'bg-slate-700 text-slate-200',
    success: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
    warning: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
    error: 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${palette[variant]}`}>
    {variant}
  </span>
}

function ToastViewport() {
  const { toasts, dismissToast } = useToasts()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur"
          role="status"
        >
          <div className="flex items-center justify-between">
            {toast.title ? <div className="text-sm font-semibold text-slate-100">{toast.title}</div> : <span className="text-sm font-semibold text-slate-100">Notification</span>}
            <ToastBadge variant={toast.variant ?? 'info'} />
          </div>
          <div className="text-xs text-slate-300">{toast.message}</div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="self-end text-[10px] uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-200"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}
