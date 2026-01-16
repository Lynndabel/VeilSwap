import { useState } from 'react'
import { Swap } from './pages/Swap'
import { Landing } from './pages/Landing'
import { Page } from '.pages/page'

export default function App() {
  const [route, setRoute] = useState<'landing' | 'swap'>('swap')
  return (
    <div className="min-h-screen">
      {route === 'landing' ? (
        <Landing onLaunch={() => setRoute('swap')} />
      ) : (
        <Swap />
      )}
    </div>
  )
}
