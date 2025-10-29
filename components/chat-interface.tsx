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
      title: "New Chat",
      messages: [],
      lastActive: new Date(),
    },
  ])
  const {message, sendMessage} = useChat(); 
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
                    disabled={!inputValue.trim()}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 sm:h-10 sm:w-10"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

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
                    message.sender === "user" ? "justify-end" : "justify-start",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 shadow-sm transition-all hover:shadow-md sm:max-w-[80%] sm:px-4 sm:py-3",
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
                    disabled={!inputValue.trim()}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 sm:h-8 sm:w-8"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

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
