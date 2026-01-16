import { useState } from 'react'
import { Landing } from './pages/Landing'
import { SwapProvider } from './features/swap/state'
import { SwapScreen } from './features/swap/SwapScreen'

export default function App() {
  const [route, setRoute] = useState<'landing' | 'swap'>('swap')
  return (
    <div className="min-h-screen">
      {route === 'landing' ? (
        <Landing onLaunch={() => setRoute('swap')} />
      ) : (
        <SwapProvider>
          <SwapScreen />
        </SwapProvider>
      )}
    </div>
  )
}
