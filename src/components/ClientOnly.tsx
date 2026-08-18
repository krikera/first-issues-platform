"use client";

import { useEffect, useState } from "react"

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Render the children only after the component has mounted on the client.
 * Use this to wrap components that can't be server-side rendered or that
 * have different server and client rendering.
 *
 * IMPORTANT: Children should be passed as elements, not as a function,
 * to avoid React Hook order violations.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
