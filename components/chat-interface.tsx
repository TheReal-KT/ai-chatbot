"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoiceWaveform } from "@/components/voice-waveform"
import { Sidebar } from "@/components/sidebar"

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

export function ChatInterface() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Welcome Chat",
      messages: [
        {
          id: "1",
          text: "Hello! How can I help you today?",
          sender: "bot",
          timestamp: new Date(),
        },
      ],
      lastActive: new Date(),
    },
  ])
  const [currentSessionId, setCurrentSessionId] = useState("1")
  const [pendingNewChat, setPendingNewChat] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentSession = chatSessions.find((s) => s.id === currentSessionId)
  const messages = currentSession?.messages || []

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
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: inputValue.slice(0, 30),
        messages: [],
        lastActive: new Date(),
      }
      setChatSessions((prev) => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
      setPendingNewChat(false)
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
    setInputValue("")

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to assist you! This is a demo response.",
        sender: "bot",
        timestamp: new Date(),
      }
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [...session.messages, botMessage],
                lastActive: new Date(),
              }
            : session,
        ),
      )
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
      }, 5000)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectChat={setCurrentSessionId}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="relative flex flex-1 flex-col">
        {/* Voice Waveform Indicator */}
        {isListening && (
          <div className="absolute left-1/2 top-8 z-10 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <VoiceWaveform />
          </div>
        )}

        {/* Chat Header */}
        <div className="flex items-center justify-between border-b bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">AI Assistant</h2>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.sender === "user" ? "justify-end" : "justify-start",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
                  message.sender === "user"
                    ? "bg-[var(--user-message)] text-[var(--user-message-foreground)]"
                    : "bg-[var(--bot-message)] text-[var(--bot-message-foreground)] border",
                )}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className="mt-1 block text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-card p-4">
          <div className="mx-auto flex max-w-4xl items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="pr-12 shadow-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Voice Input Button */}
            <Button
              size="icon"
              variant={isListening ? "default" : "outline"}
              onClick={toggleVoiceInput}
              className={cn(
                "h-12 w-12 rounded-full shadow-md transition-all hover:scale-105",
                isListening && "animate-pulse",
              )}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
