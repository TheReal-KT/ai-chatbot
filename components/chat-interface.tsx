"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoiceWaveform } from "@/components/voice-waveform"
import { Sidebar } from "@/components/sidebar"
import { useChat } from "@ai-sdk/react"
import { createClient as createSupabaseClient } from "@/lib/supabase/client"

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

type ChatSession = {
  id: string
  title: string
  messages: Message[]
  lastActive: Date
}

type UIPart = { type: string; text? : string; [key: string]: any }

function getTextFromParts( parts?: UIPart[]): string { 
  if(!parts || parts.length === 0) return ""
  return parts
    .map((p) => (p.type === 'text' ? (p.text ?? '') : ''))
    .filter(Boolean)
    .join('\n')
    .trim()
}

function MessageBubble({
  role, 
  parts,
}: { 
  role: "user" | "bot" | 'system' | string
  parts?: UIPart[],
}) { 
  const isUser = role === 'user'
  const text = getTextFromParts(parts)

  return ( 
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              isUser
                ? 'bg-blue-700 text-white'
                : 'bg-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
            }`}
          >
            {isUser ? 'You' : 'AI'}
          </div>
          <span className="text-xs opacity-70">{isUser ? 'You' : 'Assistant'}</span>
        </div>
        <div className="whitespace-pre-wrap">
          {text || (parts?.length ? JSON.stringify(parts, null, 2) : 'No content')}
        </div>
      </div>
    </div>
  )
}


export function ChatInterface() {
  const supabase = createSupabaseClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "New Chat",
      messages: [],
      lastActive: new Date(),
    },
  ])
 
  const [currentSessionId, setCurrentSessionId] = useState("1")
  const [pendingNewChat, setPendingNewChat] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isLoading, error } = useChat({
    id: currentSessionId,
    onFinish: async (assistantMessage) => {
      try {
        const assistantText = getTextFromParts((assistantMessage as any).parts)
        if (!assistantText || !userId) return
        await supabase.from("chat_messages").insert({
          session_id: currentSessionId,
          user_id: userId,
          role: "assistant",
          content: assistantText,
        })
        await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", currentSessionId)
      } catch {
        // ignore persistence errors to keep UI responsive
      }
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const createNewChat = () => {
    setPendingNewChat(true)
  }

  const deleteChat = (sessionId: string) => {
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (currentSessionId === sessionId && chatSessions.length > 1) {
      const remainingSessions = chatSessions.filter((s) => s.id !== sessionId)
      setCurrentSessionId(remainingSessions[0].id)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    if (pendingNewChat) {
      const title = inputValue.slice(0, 30)
      const createSession = async () => {
        try {
          let newId = Date.now().toString()
          if (userId) {
            const { data } = await supabase
              .from("chat_sessions")
              .insert({ user_id: userId, title })
              .select("id,updated_at")
              .single()
            if (data?.id) newId = data.id
          }
          const newSession: ChatSession = {
            id: newId,
            title,
            messages: [],
            lastActive: new Date(),
          }
          setChatSessions((prev) => [newSession, ...prev])
          setCurrentSessionId(newSession.id)
        } catch {
          // Fallback to local-only session
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title,
            messages: [],
            lastActive: new Date(),
          }
          setChatSessions((prev) => [newSession, ...prev])
          setCurrentSessionId(newSession.id)
        } finally {
          setPendingNewChat(false)
        }
      }
      void createSession()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              title: session.messages.length === 0 ? inputValue.slice(0, 30) : session.title,
              lastActive: new Date(),
            }
          : session,
      ),
    )
    // Persist user message if possible
    if (userId) {
      void supabase.from("chat_messages").insert({
        session_id: currentSessionId,
        user_id: userId,
        role: "user",
        content: inputValue,
      })
    }

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {isListening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <VoiceWaveform />
            <Button size="lg" variant="outline" onClick={toggleVoiceInput} className="rounded-full px-8 bg-transparent">
              Stop Listening
            </Button>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300",
        )}
      >
        <Sidebar
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onNewChat={createNewChat}
          onSelectChat={(id) => {
            setCurrentSessionId(id)
            setIsSidebarOpen(false)
          }}
          onDeleteChat={deleteChat}
          isOpen={isSidebarOpen}
        />
      </div>

      {/* Main Chat Area */}
      <div className="relative flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="h-8 w-8">
              {isSidebarOpen ? <X className="h-4 w-4 lg:hidden" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div>
              <h2 className="text-base font-semibold text-card-foreground sm:text-lg">AI Assistant</h2>
              <p className="hidden text-sm text-muted-foreground sm:block">Always here to help</p>
            </div>
          </div>
        </div>

        {messages.length === 0 ? (
          // Empty state: centered input
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-4">
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">How can I help you today?</h1>
                <p className="text-muted-foreground">Start a conversation by typing a message below</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="pr-10 shadow-lg text-base h-12 sm:h-14 sm:pr-12"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 sm:h-10 sm:w-10"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
                {error ? (
                  <div className="text-xs text-red-600">{String((error as any)?.message ?? error)}</div>
                ) : null}

                {/* Voice Input Button */}
                <Button
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleVoiceInput}
                  className={cn("h-12 w-12 rounded-full shadow-lg transition-all hover:scale-105 sm:h-14 sm:w-14")}
                >
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Normal layout with messages
          <>
            {/* Messages Container */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MessageBubble
                    key={message.id}
                    role={message.role === "user" ? "user" : "bot"}
                    parts={(message as any).parts}
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-card p-3 sm:p-4">
              <div className="mx-auto flex max-w-4xl items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="pr-10 shadow-sm sm:pr-12"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 sm:h-8 sm:w-8"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                {error ? (
                  <div className="text-xs text-red-600">{String((error as any)?.message ?? error)}</div>
                ) : null}

                {/* Voice Input Button */}
                <Button
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleVoiceInput}
                  className={cn("h-10 w-10 rounded-full shadow-md transition-all hover:scale-105 sm:h-12 sm:w-12")}
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
