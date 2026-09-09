"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

function ThemeProvider({
  children,
}: React.PropsWithChildren) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    const storedTheme = window.localStorage.getItem("theme")
    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "system"
  })
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light")
    }
    mediaQuery.addEventListener("change", updateSystemTheme)

    return () => mediaQuery.removeEventListener("change", updateSystemTheme)
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem("theme", theme)
    const resolvedTheme = theme === "system" ? systemTheme : theme
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
    document.documentElement.classList.toggle("light", resolvedTheme === "light")
    document.documentElement.style.colorScheme = resolvedTheme
  }, [systemTheme, theme])

  const resolvedTheme = theme === "system" ? systemTheme : theme

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
export { useTheme }
