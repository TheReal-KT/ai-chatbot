import { NextRequest, NextResponse } from 'next/server'
import { CartesiaClient } from '@cartesia/cartesia-js'

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.CARTESIA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Cartesia API key not configured' },
        { status: 500 }
      )
    }

    const cartesia = new CartesiaClient({
      apiKey: apiKey,
    })

    // Use the specified voice or default to a pleasant voice
    const selectedVoiceId = voiceId || 'a0e99841-438c-4a64-b679-ae501e7d6091' // Barbershop Man

    // Generate speech using Cartesia
    const response = await cartesia.tts.bytes({
      modelId: 'sonic-english',
      transcript: text,
      voice: {
        mode: 'id',
        id: selectedVoiceId,
      },
      outputFormat: {
        container: 'mp3',
        encoding: 'mp3',
        sampleRate: 44100,
      },
    })

    // Convert the audio buffer to base64
    const audioBuffer = Buffer.from(response)
    const base64Audio = audioBuffer.toString('base64')

    return NextResponse.json({
      audio: base64Audio,
      contentType: 'audio/mpeg',
    })
  } catch (error) {
    console.error('Cartesia TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
