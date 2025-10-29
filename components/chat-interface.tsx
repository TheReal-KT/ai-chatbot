"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoiceWaveform } from "@/components/voice-waveform"
import { Sidebar } from "@/components/sidebar"
import { useChat } from '@ai-sdk/react'

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

// AI SDK compatible message type - using the same structure as useChat
type AIMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

// Updated ChatSession type to store messages compatible with AI SDK
type ChatSession = {
  id: string
  title: string
  messages: any[] // Using any[] to handle AI SDK message type compatibility
  lastActive: Date
}

export function ChatInterface() {
  // Session management state (for sidebar)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "New Chat",
      messages: [],
      lastActive: new Date(),
    },
  ])
  const [currentSessionId, setCurrentSessionId] = useState("1")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isListening, setIsListening] = useState(false); 

  // AI SDK integration for current session
  const { messages, sendMessage} = useChat()
  const [input, setInput] = useState(""); 


  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save current session messages when switching sessions
  const saveCurrentSession = () => {
    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages, lastActive: new Date() }
        : session
    ))
  }

  // Load session messages when switching
  const loadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      sendMessage(session.messages ?? [])
    }
  }

  // Handle Submit 
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault();
    const value = input.trim(); 
    if (!value) return; 
    setInput(""); 
  }
   
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    e.preventDefault(); 
    setInput(e.target.value); 
  }

  // Handle session switching
  const handleSelectChat = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      saveCurrentSession() // Save current session first
      setCurrentSessionId(sessionId)
      loadSession(sessionId) // Load new session
    }
  }

  // Create new chat session
  const createNewChat = () => {
    saveCurrentSession() // Save current session first
    
    const newSessionId = Date.now().toString()
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      messages: [],
      lastActive: new Date(),
    }
    
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSessionId)
  }

  // Delete chat session
  const deleteChat = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId)
      
      // If deleting current session, switch to another one
      if (sessionId === currentSessionId && filtered.length > 0) {
        const newCurrentId = filtered[0].id
        setCurrentSessionId(newCurrentId)
        loadSession(newCurrentId)
      } else if (filtered.length === 0) {
        // If no sessions left, create a new one
        createNewChat()
      }
      
      return filtered
    })
  }

  // Update session title based on first message
  useEffect(() => {
    if (messages.length > 0) {
      const firstUserMessage = messages.find((m: any) => m.role === 'user')
      if (firstUserMessage) {
        const title = (firstUserMessage as any).content?.slice(0, 30) + ((firstUserMessage as any).content?.length > 30 ? '...' : '')
        setChatSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? { ...session, title }
            : session
        ))
      }
    }
  }, [messages, currentSessionId])

  // Save session when component unmounts or messages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCurrentSession()
    }, 1000) // Debounce saves

    return () => clearTimeout(timeoutId)
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
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
        onSelectChat={handleSelectChat}
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
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Thinking..." : "Always here to help"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={(message as any).id ?? index}
              className={cn(
                "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                (message as any).role === "user" ? "justify-end" : "justify-start",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
                  (message as any).role === "user"
                    ? "bg-[var(--user-message)] text-[var(--user-message-foreground)]"
                    : "bg-[var(--bot-message)] text-[var(--bot-message-foreground)] border",
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{(message as any).content}</p>
                <span className="mt-1 block text-xs opacity-70">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--bot-message)] text-[var(--bot-message-foreground)] border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm opacity-70">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-card p-4">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="pr-12 shadow-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!input?.trim() || isLoading}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Voice Input Button */}
            <Button
              type="button"
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
          </form>
        </div>
      </div>
    </div>
  )
}
