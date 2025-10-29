"use client"

import { useEffect, useState } from "react"

export function VoiceWaveform() {
  const [waveHeights, setWaveHeights] = useState([12, 20, 28, 20, 12])

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights([
        Math.random() * 20 + 10,
        Math.random() * 30 + 15,
        Math.random() * 40 + 20,
        Math.random() * 30 + 15,
        Math.random() * 20 + 10,
      ])
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-2xl backdrop-blur-sm animate-pulse">
        <div className="flex items-center gap-2">
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-blue-600 transition-all duration-150 ease-out"
              style={{
                height: `${height}px`,
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-lg font-medium text-foreground">Listening...</p>
    </div>
  )
}
