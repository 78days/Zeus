"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import * as Sentry from "@sentry/nextjs"

export function SessionReplay({ sessionId }: { sessionId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playlistUrl, setPlaylistUrl] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/replays/${encodeURIComponent(sessionId)}`
        )
        if (response.status === 202) {
          timer = setTimeout(poll, 2000)
          return
        }
        if (!response.ok) throw new Error("Unable to load session replay")

        const playlist = await response.text()
        if (!cancelled) {
          const url = URL.createObjectURL(
            new Blob([playlist], { type: "application/vnd.apple.mpegurl" })
          )
          setPlaylistUrl(url)
        }
      } catch (cause) {
        Sentry.withScope((scope) => {
          scope.setTag("operation", "replays.load-client")
          scope.setExtra("sessionId", sessionId)
          Sentry.captureException(cause)
        })
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : String(cause))
      }
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !playlistUrl) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(playlistUrl)
      hls.attachMedia(video)
      return () => {
        hls.destroy()
        URL.revokeObjectURL(playlistUrl)
      }
    }

    video.src = playlistUrl
    return () => {
      video.removeAttribute("src")
      video.load()
      URL.revokeObjectURL(playlistUrl)
    }
  }, [playlistUrl])

  return (
    <div className="flex size-full min-h-0 items-center justify-center bg-black">
      {error ? (
        <p className="p-4 text-sm text-red-300">{error}</p>
      ) : playlistUrl ? (
        <video
          ref={videoRef}
          className="size-full object-contain"
          controls
          muted
          playsInline
        />
      ) : (
        <p className="text-sm text-white/60">Preparing replay...</p>
      )}
    </div>
  )
}
