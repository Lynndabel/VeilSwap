import { useCallback, useMemo } from 'react'
import { StepFrame } from '../components/StepFrame'
import { getNextStep } from '../steps'
import { useSwap } from '../state'
import { useWallet, type WalletStatus } from '../../wallet/WalletProvider'

const STATUS_STYLES: Record<WalletStatus, { label: string; className: string }> = {
  disconnected: {
    label: 'Disconnected',
    className: 'border-white/10 bg-white/5 text-slate-300'
  },
  connecting: {
    label: 'Connecting…',
    className: 'border-amber-400/30 bg-amber-400/10 text-amber-200'
  },
  ready: {
    label: 'Ready',
    className: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
  },
  unsupported: {
    label: 'Wrong Network',
    className: 'border-rose-400/40 bg-rose-500/10 text-rose-200'
  },
  error: {
    label: 'Error',
    className: 'border-rose-400/40 bg-rose-500/10 text-rose-200'
  }
}

function truncateAddress(address?: string) {
  if (!address) return 'Not connected'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function formatTimestamp(timestamp?: number) {
  if (!timestamp) return 'Just now'
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })
    return formatter.format(timestamp * 1000)
  } catch {
    return new Date(timestamp * 1000).toLocaleString()
  }
}

export function ConnectStep() {
  const {
    state: { lastTx },
    dispatch
  } = useSwap()
  const {
    status,
    address,
    balance,
    network,
    error,
    isFuji,
    connect,
    disconnect,
    refresh
  } = useWallet()

  const statusMeta = STATUS_STYLES[status] ?? STATUS_STYLES.disconnected
  const canProceed = status === 'ready' && isFuji

  const onNext = useCallback(() => {
    const next = getNextStep('connect')
    dispatch({ type: 'SET_STEP', step: next })
  }, [dispatch])

  const onConnect = useCallback(async () => {
    try {
      await connect()
    } catch (_) {
      /* handled in provider */
    }
  }, [connect])

  const onDisconnect = useCallback(() => {
    disconnect()
  }, [disconnect])

  const onRefresh = useCallback(async () => {
    try {
      await refresh()
    } catch (_) {
      /* handled in provider */
    }
  }, [refresh])

  const networkSummary = useMemo(() => {
    if (!network) return 'No network detected'
    return `${network.name ?? 'Unknown'} (${network.chainId})`
  }, [network])

  const footerContent = useMemo(() => {
    if (status === 'unsupported') {
      return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 text-xs text-amber-200">
          Switch to <span className="font-semibold">Avalanche Fuji</span> in your wallet to continue. Use RPC URL from your
          environment config if prompted.
        </div>
      )
    }
    if (error) {
      return (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200">{error}</div>
      )
    }
    return null
  }, [error, status])

  const onViewReceipt = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'confirmed' })
  }, [dispatch])

  return (
    <StepFrame
      step="connect"
      onNext={onNext}
      nextDisabled={!canProceed}
      nextLabel="Continue"
      statusBadge={
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
      }
      footer={footerContent}
    >
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wallet</div>
            <div className="text-lg font-semibold text-slate-100">{truncateAddress(address)}</div>
            <div className="text-xs text-slate-400">
              Native balance: {balance ? `${Number.parseFloat(balance.native).toFixed(4)} AVAX` : '—'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Network</div>
            <div className="text-sm text-slate-200">{networkSummary}</div>
            <div className="text-xs text-slate-400">
              {isFuji ? 'Fuji testnet verified.' : 'Awaiting Fuji network confirmation.'}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {(status === 'disconnected' || status === 'error') && (
              <button
                onClick={onConnect}
                className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-50 transition hover:bg-indigo-500/90"
              >
                Connect Wallet
              </button>
            )}
            {status === 'connecting' && (
              <button
                disabled
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Connecting…
              </button>
            )}
            {(status === 'ready' || status === 'unsupported') && (
              <button
                onClick={onRefresh}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-slate-100"
              >
                Refresh
              </button>
            )}
            {status === 'ready' && (
              <button
                onClick={onDisconnect}
                className="rounded-full border border-rose-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:border-rose-400 hover:text-rose-100"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {lastTx ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Last swap</div>
            <button
              type="button"
              onClick={onViewReceipt}
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-300 transition hover:text-indigo-100"
            >
              View receipt
            </button>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>{lastTx.amountIn} {lastTx.tokenIn.symbol} → {lastTx.amountOut ?? '--'} {lastTx.tokenOut.symbol}</span>
              <span className="text-[11px] text-slate-500">{formatTimestamp(lastTx.timestamp)}</span>
            </div>
            <div className="truncate text-[11px] text-slate-500">{lastTx.hash}</div>
          </div>
        </div>
      ) : null}
    </StepFrame>
  )
}
