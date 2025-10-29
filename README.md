# AI Chatbot Assistant

An interactive, front‑end AI assistant experience built with Next.js (App Router) and TypeScript. It provides a multi‑session chat interface, a visual voice "listening" indicator, and productivity pages for News and To‑Dos — all wrapped in a clean, responsive UI.

## What This Assistant Is About

The AI Assistant is a demonstration UI for conversational help and daily productivity. It lets you:
- Start and manage multiple chat sessions with an assistant.
- See a voice waveform indicator when "listening" mode is toggled (visual only).
- Browse a mock News dashboard to stay informed.
- Track tasks with a simple To‑Do list.

Note: This project currently uses mock data and demo bot responses. It does not connect to a real AI backend yet. You can wire in your own API later (see "Integrating a Real Backend").

## Features

- Multi‑session chat with a sidebar for quick navigation.
- Animated voice waveform indicator to simulate voice input status.
- News dashboard with categorized, time‑stamped mock articles.
- To‑Do list with priorities, active/completed views, and quick add.
- Modern, accessible UI components and icons.

## Quick Start

Prerequisites:
- Node.js 18+ and npm (or yarn/pnpm/bun).

Install and run:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## How to Use

- Chat: Open the app and start typing in the input. Press Enter or click Send.
- New chat: Use the sidebar "New Chat" to create another session.
- Voice indicator: Click the mic button to toggle the waveform (visual demo).
- News: Navigate to `/news` from the sidebar to view articles.
- To‑Dos: Navigate to `/todos` to add, complete, or delete tasks.

## Project Structure

- `app/` – App Router pages
  - `page.tsx` – Home with the chat interface
  - `news/page.tsx` – News dashboard
  - `todos/page.tsx` – To‑Do list
- `components/` – Reusable UI and app components
  - `chat-interface.tsx` – Chat UI logic and layout
  - `voice-waveform.tsx` – Visual voice indicator
  - `sidebar.tsx` – Navigation and chat session shortcuts
- `lib/utils.ts` – Utility helpers
- `globals.css` – Global styles

## Tech Stack

- `next` (App Router) + `typescript`
- `react`, `react-dom`
- `tailwindcss` + `tailwindcss-animate`
- `lucide-react` icons
- Radix UI primitives and custom UI components (in `components/ui/*`)

## Integrating a Real Backend

This UI is ready to connect to your AI or API service:
- Replace the demo bot response in `components/chat-interface.tsx` (`handleSendMessage`) with a call to your backend.
- Add real voice capture if desired (e.g., Web Speech API or a custom recorder) and stream transcriptions to your chat handler.
- Persist sessions/messages by saving to a database via API routes.

## Web Search (SerpAPI)

The chat API can search the web using SerpAPI. To enable it:

- Create a `.env.local` file at the project root and add:
```
SERPAPI_API_KEY=your_serpapi_key_here
```
- Restart the dev server after adding or changing env vars.
- In the chat, ask questions that require internet search; the API route will call SerpAPI server-side.

If the key is missing or invalid, the chat will return a clear error from the search tool.

## Scripts

- `npm run dev` – Start the local development server.
- `npm run build` – Build for production.
- `npm run start` – Run the production build.
- `npm run lint` – Lint the codebase.

## Deployment

You can deploy to any Next.js‑compatible platform. Vercel is recommended for a quick setup. Build with `npm run build` and follow your platform’s deployment instructions.

---

Questions or ideas? Feel free to extend the components or plug in your preferred AI service to make the assistant truly conversational.
