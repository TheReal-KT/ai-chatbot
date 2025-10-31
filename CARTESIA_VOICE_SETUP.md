# Cartesia Voice Integration Setup

This guide explains how to set up and use the Cartesia voice capabilities in your AI chatbot.

## Prerequisites

1. A Cartesia API account
2. Cartesia API key

## Setup Instructions

### 1. Get Your Cartesia API Key

1. Sign up at [Cartesia](https://cartesia.ai/)
2. Navigate to your dashboard
3. Generate an API key

### 2. Add API Key to Environment Variables

Add your Cartesia API key to your `.env.local` file:

```env
CARTESIA_API_KEY=your_cartesia_api_key_here
```

**Important:** Never commit your `.env.local` file to version control. It should already be in your `.gitignore`.

### 3. Restart Your Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## Features

### Voice Settings

- **Voice Toggle**: Enable/disable voice output from the settings icon in the chat header
- **Voice Selection**: Choose from 5 different voices:
  - **Barbershop Man**: Warm, friendly male voice (default)
  - **British Lady**: Professional British female voice
  - **Calm Lady**: Soothing female voice
  - **Newsman**: Professional news anchor voice
  - **Friendly Reading Man**: Conversational male voice

### Using Voice Features

1. **Enable Voice**: Click the settings icon (⚙️) in the chat header and ensure "Voice Enabled" is active
2. **Select Voice**: Choose your preferred voice from the dropdown menu
3. **Play Message**: Click the speaker icon (🔊) on any AI response to hear it read aloud
4. **Stop Playback**: Click the muted speaker icon (🔇) to stop the current playback

## Technical Details

### Components Created

1. **API Route** (`/app/api/voice/route.ts`):
   - Handles text-to-speech conversion using Cartesia API
   - Returns audio as base64-encoded MP3

2. **Custom Hook** (`/lib/hooks/use-text-to-speech.ts`):
   - Manages TTS state (playing, loading, errors)
   - Handles voice selection
   - Controls audio playback

3. **Voice Settings Component** (`/components/voice-settings.tsx`):
   - UI for voice configuration
   - Voice selection dropdown
   - Enable/disable toggle

4. **Updated Chat Interface** (`/components/chat-interface.tsx`):
   - Speaker buttons on AI messages
   - Integration with TTS hook
   - Voice state management

### API Usage

The implementation uses Cartesia's `sonic-english` model with the following configuration:

```typescript
{
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
}
```

## Customization

### Adding More Voices

To add more voices, update the `CARTESIA_VOICES` array in `/lib/hooks/use-text-to-speech.ts`:

```typescript
export const CARTESIA_VOICES: Voice[] = [
  // ... existing voices
  {
    id: 'your-voice-id',
    name: 'Voice Name',
    description: 'Voice description',
  },
]
```

You can find available voice IDs in the [Cartesia documentation](https://docs.cartesia.ai/).

### Changing Default Voice

To change the default voice, modify the initial state in the `useTextToSpeech` hook or update the fallback voice ID in `/app/api/voice/route.ts`.

## Troubleshooting

### Voice Not Playing

1. Check that your `CARTESIA_API_KEY` is correctly set in `.env.local`
2. Verify the development server was restarted after adding the key
3. Check browser console for errors
4. Ensure voice is enabled in the settings

### API Errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Check server logs for details

### Audio Quality

The current implementation uses 44.1kHz MP3 encoding. You can adjust the sample rate in `/app/api/voice/route.ts` if needed:

```typescript
outputFormat: {
  container: 'mp3',
  encoding: 'mp3',
  sampleRate: 22050, // Lower for smaller files, higher for better quality
}
```

## Cost Considerations

Cartesia charges based on the number of characters processed. Monitor your usage in the Cartesia dashboard to avoid unexpected costs.

## Next Steps

- Implement voice input (speech-to-text) using the existing microphone button
- Add voice speed controls
- Implement voice caching for repeated messages
- Add support for multiple languages
