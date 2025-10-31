import { useState, useCallback, useRef } from 'react'

export type Voice = {
  id: string
  name: string
  description?: string
}

// Popular Cartesia voices
export const CARTESIA_VOICES: Voice[] = [
  {
    id: 'a0e99841-438c-4a64-b679-ae501e7d6091',
    name: 'Barbershop Man',
    description: 'Warm, friendly male voice',
  },
  {
    id: '79a125e8-cd45-4c13-8a67-188112f4dd22',
    name: 'British Lady',
    description: 'Professional British female voice',
  },
  {
    id: '694f9389-aac1-45b6-b726-9d9369183238',
    name: 'Calm Lady',
    description: 'Soothing female voice',
  },
  {
    id: '41534e16-2966-4c6b-9670-111411def906',
    name: 'Newsman',
    description: 'Professional news anchor voice',
  },
  {
    id: '87748186-23bb-4158-a1eb-332911b0b708',
    name: 'Friendly Reading Man',
    description: 'Conversational male voice',
  },
]

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<Voice>(CARTESIA_VOICES[0])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(
    async (text: string, voiceId?: string) => {
      try {
        setIsLoading(true)
        setError(null)

        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }

        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voiceId: voiceId || selectedVoice.id,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate speech')
        }

        const data = await response.json()

        // Create audio element from base64
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`)
        audioRef.current = audio

        audio.onplay = () => setIsPlaying(true)
        audio.onended = () => {
          setIsPlaying(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          setError('Failed to play audio')
          setIsPlaying(false)
          audioRef.current = null
        }

        await audio.play()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsPlaying(false)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedVoice]
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }, [])

  const changeVoice = useCallback((voice: Voice) => {
    setSelectedVoice(voice)
  }, [])

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    error,
    selectedVoice,
    changeVoice,
    voices: CARTESIA_VOICES,
  }
}
