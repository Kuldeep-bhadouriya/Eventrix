"use client"

import { useState, useCallback, useEffect } from "react"
import Preloader from "@/components/ui/preloader"

export default function PreloaderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [showPreloader, setShowPreloader] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleComplete = useCallback(() => {
    setShowPreloader(false)
  }, [])

  // Don't show preloader on server-side
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <>
      {showPreloader && <Preloader onComplete={handleComplete} />}
      {children}
    </>
  )
}
