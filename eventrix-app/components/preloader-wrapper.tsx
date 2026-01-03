"use client"

import { useState, useCallback, useEffect } from "react"
import { usePathname } from "next/navigation"
import Preloader from "@/components/ui/preloader"

export default function PreloaderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [showPreloader, setShowPreloader] = useState(false)

  useEffect(() => {
    // Show preloader only on home page
    if (pathname === "/") {
      setShowPreloader(true)
    } else {
      setShowPreloader(false)
    }
  }, [pathname])

  const handleComplete = useCallback(() => {
    setShowPreloader(false)
  }, [])

  return (
    <>
      {showPreloader && <Preloader onComplete={handleComplete} />}
      {children}
    </>
  )
}
