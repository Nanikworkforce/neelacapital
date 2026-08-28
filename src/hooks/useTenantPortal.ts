import { useEffect, useState } from 'react'
import { defaultTenantHero, TENANT_PORTAL_URL } from '../data/rentals'

export function useTenantPortal() {
  const [title, setTitle] = useState(defaultTenantHero.title)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetch(TENANT_PORTAL_URL, { signal: controller.signal, mode: 'cors' })
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((html) => {
        const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
        const parsed = match?.[1]?.replace(/<[^>]+>/g, '').trim()
        if (parsed) {
          setTitle(parsed)
          setLive(true)
        }
      })
      .catch(() => setLive(false))

    return () => controller.abort()
  }, [])

  return { title, live, portalUrl: TENANT_PORTAL_URL }
}
