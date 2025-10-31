# Quick Start: Voice Integration

## 🎯 What Was Added

Your AI chatbot now has **text-to-speech capabilities** powered by Cartesia AI!

## 🚀 Quick Setup (3 Steps)

### Step 1: Get API Key
1. Go to [cartesia.ai](https://cartesia.ai/)
2. Sign up and get your API key

### Step 2: Add to Environment
Add this line to your `.env.local` file:
```
CARTESIA_API_KEY=your_api_key_here
```

### Step 3: Restart Server
```bash
npm run dev
```

## ✨ How to Use

1. **Open Voice Settings**: Click the ⚙️ icon in the chat header
2. **Enable Voice**: Toggle "Voice Enabled"
3. **Choose a Voice**: Select from 5 different voices
4. **Play Messages**: Click 🔊 on any AI response to hear it

## 🎤 Available Voices

- **Barbershop Man** - Warm, friendly (default)
- **British Lady** - Professional British accent
- **Calm Lady** - Soothing and gentle
- **Newsman** - Professional news anchor
- **Friendly Reading Man** - Conversational

## 📁 Files Created

```
app/api/voice/route.ts              # API endpoint for TTS
lib/hooks/use-text-to-speech.ts     # React hook for voice control
components/voice-settings.tsx        # Settings UI component
components/ui/dropdown-menu.tsx      # Dropdown menu component
```

## 🔧 Files Modified

```
components/chat-interface.tsx        # Added voice controls & playback
package.json                         # Added @cartesia/cartesia-js
```

## 💡 Features

✅ Click-to-play on any AI message  
✅ 5 different voice options  
✅ Easy enable/disable toggle  
✅ Visual feedback (speaker icons)  
✅ Automatic audio management  

## 🎨 UI Updates

- **Header**: Voice settings button added
- **Messages**: Speaker button on AI responses
- **Settings Menu**: Voice selection dropdown

## 📝 Next Steps

Want to enhance it further? Consider:
- Adding voice speed controls
- Implementing speech-to-text for the mic button
- Adding more Cartesia voices
- Caching frequently used audio

---

**Need Help?** Check `CARTESIA_VOICE_SETUP.md` for detailed documentation.
