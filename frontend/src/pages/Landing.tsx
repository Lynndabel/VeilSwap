type Props = { onLaunch: () => void }

export function Landing({ onLaunch }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold">PrivateSwap</h1>
        <p className="mt-4 text-gray-300">
          Confidential swaps on Avalanche Fuji. Hide your amounts, keep price discovery always.
        </p>
      </div>
      <button
        onClick={onLaunch}
        className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition font-semibold"
      >
        Launch App
      </button>
      <div className="text-xs text-gray-400">MVP demo build</div>
    </div>
  )
}
