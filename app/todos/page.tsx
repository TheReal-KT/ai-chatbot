"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Menu, Plus, Trash2, Calendar } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  priority: "low" | "medium" | "high"
}

export default function TodosPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      text: "Review project documentation",
      completed: false,
      createdAt: new Date(),
      priority: "high",
    },
    {
      id: "2",
      text: "Schedule team meeting",
      completed: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: "medium",
    },
    {
      id: "3",
      text: "Update website content",
      completed: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: "low",
    },
  ])
  const [newTodoText, setNewTodoText] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium")

  const addTodo = () => {
    if (!newTodoText.trim()) return

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      createdAt: new Date(),
      priority: selectedPriority,
    }

    setTodos((prev) => [newTodo, ...prev])
    setNewTodoText("")
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTodo()
    }
  }

  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
      case "low":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chatSessions={[]}
        currentSessionId=""
        onNewChat={() => {}}
        onSelectChat={() => {}}
        onDeleteChat={() => {}}
        isOpen={isSidebarOpen}
      />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">To-Do List</h1>
              <p className="text-sm text-muted-foreground">
                {activeTodos.length} active {activeTodos.length === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* Todo Content */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Add New Todo */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Add a new task..."
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex gap-1">
                    {(["low", "medium", "high"] as const).map((priority) => (
                      <Button
                        key={priority}
                        size="sm"
                        variant={selectedPriority === priority ? "default" : "ghost"}
                        onClick={() => setSelectedPriority(priority)}
                        className="capitalize"
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={addTodo} disabled={!newTodoText.trim()} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Todos */}
            {activeTodos.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground">Active Tasks</h2>
                {activeTodos.map((todo, index) => (
                  <Card
                    key={todo.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:shadow-md"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{todo.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {todo.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span
                        className={cn("rounded-full px-2 py-1 text-xs font-medium", getPriorityColor(todo.priority))}
                      >
                        {todo.priority}
                      </span>
                      <Button size="icon" variant="ghost" onClick={() => deleteTodo(todo.id)} className="h-8 w-8">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground">Completed Tasks</h2>
                {completedTodos.map((todo) => (
                  <Card key={todo.id} className="opacity-60 transition-all hover:opacity-100">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground line-through">{todo.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {todo.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span
                        className={cn("rounded-full px-2 py-1 text-xs font-medium", getPriorityColor(todo.priority))}
                      >
                        {todo.priority}
                      </span>
                      <Button size="icon" variant="ghost" onClick={() => deleteTodo(todo.id)} className="h-8 w-8">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {todos.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
