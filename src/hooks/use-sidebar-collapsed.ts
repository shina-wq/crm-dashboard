import { useEffect, useState } from "react"

const KEY = "sidebar-collapsed"

export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(KEY) === "true")

  useEffect(() => {
    localStorage.setItem(KEY, String(collapsed))
  }, [collapsed])

  return [collapsed, () => setCollapsed((c) => !c)]
}