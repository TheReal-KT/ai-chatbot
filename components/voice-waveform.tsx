"use client"

import { Card } from "@/components/ui/card"

export function VoiceWaveform() {
  return (
    <Card className="flex items-center justify-center gap-1 bg-primary/10 px-8 py-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-primary"
            style={{
              height: "24px",
              animation: `wave 1s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            height: 12px;
          }
          50% {
            height: 32px;
          }
        }
      `}</style>
      <p className="ml-4 text-sm font-medium text-primary">Listening...</p>
    </Card>
  )
}
