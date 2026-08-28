import { useCallback, useEffect, useState } from 'react'
import type { TenantProperty } from '../types/tenant'
import { TENANT_PROPERTIES_API } from '../data/rentals'

function pickImage(p: TenantProperty) {
  return p.display_image || p.image_url || p.image || ''
}

export function useTenantProperties() {
  const [properties, setProperties] = useState<TenantProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(TENANT_PROPERTIES_API)
      if (!res.ok) throw new Error('fetch failed')
      const data = (await res.json()) as TenantProperty[]
      const withImages = data.filter((p) => pickImage(p))
      setProperties(withImages)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 60_000)
    return () => clearInterval(timer)
  }, [load])

  return { properties, loading, error, refresh: load }
}
