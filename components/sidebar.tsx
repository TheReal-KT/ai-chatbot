"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Newspaper, ListTodo, Search, MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

type ChatSession = {
  id: string
  title: string
  lastActive: Date
}

type SidebarProps = {
  chatSessions: ChatSession[]
  currentSessionId: string
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  isOpen: boolean
}

export function Sidebar({
  chatSessions,
  currentSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
}: SidebarProps) {
  const [showChatHistory, setShowChatHistory] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      icon: Plus,
      label: "New Chat",
      action: () => {
        router.push("/")
        onNewChat()
      },
      href: "/",
    },
    { icon: Newspaper, label: "News", href: "/news" },
    { icon: ListTodo, label: "To-Do List", href: "/todos" },
  ]

  if (!isOpen) {
    return <aside className="w-0 overflow-hidden border-r bg-sidebar transition-all duration-300" />
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar transition-all duration-300">
      {/* Navigation Items */}
      <div className="border-b p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href ? pathname === item.href : false

            if (item.action) {
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent",
                  )}
                  onClick={item.action}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              )
            }

            return (
              <Link key={item.label} href={item.href!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Search with Chat History on Hover */}
      <div
        className="relative border-b p-3"
        onMouseEnter={() => setShowChatHistory(true)}
        onMouseLeave={() => setShowChatHistory(false)}
      >
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <Search className="h-4 w-4" />
          <span className="text-sm">Search</span>
        </Button>

        {/* Chat History Dropdown on Hover */}
        {showChatHistory && (
          <div className="absolute left-full top-0 z-50 ml-2 w-72 animate-in fade-in slide-in-from-left-2 rounded-lg border bg-card shadow-lg duration-200">
            <div className="border-b p-3">
              <h3 className="text-sm font-semibold text-card-foreground">Chat History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {chatSessions.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No chat history yet</p>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group mb-1 flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent",
                      currentSessionId === session.id && "bg-accent",
                    )}
                  >
                    <button
                      onClick={() => onSelectChat(session.id)}
                      className="flex flex-1 items-start gap-2 text-left"
                    >
                      <MessageSquare className="mt-1 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm text-card-foreground">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{session.lastActive.toLocaleDateString()}</p>
                      </div>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(session.id)
                      }}
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  )
}
