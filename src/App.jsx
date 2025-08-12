import React, { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import Vault from './pages/Vault'

function useHashRouter() {
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || '/')
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const push = (path) => { window.location.hash = path }
  return { route, push }
}

export default function App() {
  const { route, push } = useHashRouter()

  useEffect(() => {
    if (!window.location.hash) window.location.hash = '/'
  }, [])

  if (route === '/vault') return <Vault onLogout={() => push('/')} />
  return <Landing onUnlock={() => push('/vault')} />
}
