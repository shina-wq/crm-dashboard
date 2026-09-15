import { useSearchParams } from "react-router-dom"

export function useSearchParamState(
  key: string,
  defaultValue = ""
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(key) ?? defaultValue

  const setValue = (next: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)

      if (!next || next === defaultValue) {
        params.delete(key)
      } else {
        params.set(key, next)
      }

      return params
    }, { replace: true })
  }

  return [value, setValue] as const
}

export function useSearchParamNumber(
  key: string,
  defaultValue: number
) {
  const [raw, setRaw] = useSearchParamState(
    key,
    String(defaultValue)
  )

  const parsed = Number(raw)
  const value = Number.isFinite(parsed) ? parsed : defaultValue

  const setValue = (next: number) => {
    setRaw(String(next))
  }

  return [value, setValue] as const
}