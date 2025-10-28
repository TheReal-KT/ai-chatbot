"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, ExternalLink, Clock, TrendingUp } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

type NewsArticle = {
  id: string
  title: string
  description: string
  source: string
  publishedAt: Date
  url: string
  category: string
}

export default function NewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Mock news data
  const newsArticles: NewsArticle[] = [
    {
      id: "1",
      title: "AI Breakthrough: New Language Model Achieves Human-Level Understanding",
      description:
        "Researchers announce a significant advancement in natural language processing with implications for conversational AI.",
      source: "Tech News Daily",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      url: "#",
      category: "Technology",
    },
    {
      id: "2",
      title: "Global Climate Summit Reaches Historic Agreement",
      description: "World leaders commit to ambitious carbon reduction targets in landmark environmental accord.",
      source: "World News Network",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      url: "#",
      category: "Environment",
    },
    {
      id: "3",
      title: "Stock Markets Rally on Positive Economic Data",
      description:
        "Major indices reach new highs as investors respond to encouraging employment and inflation figures.",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      url: "#",
      category: "Business",
    },
    {
      id: "4",
      title: "Revolutionary Medical Treatment Shows Promise in Clinical Trials",
      description: "New therapy demonstrates remarkable effectiveness in treating previously incurable conditions.",
      source: "Medical Journal",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      url: "#",
      category: "Health",
    },
    {
      id: "5",
      title: "Space Agency Announces Plans for Mars Mission",
      description: "Ambitious project aims to establish permanent human presence on the Red Planet within the decade.",
      source: "Space News",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      url: "#",
      category: "Science",
    },
  ]

  const getTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
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
              <h1 className="text-2xl font-bold text-card-foreground">News Dashboard</h1>
              <p className="text-sm text-muted-foreground">Stay updated with the latest headlines</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Trending Now</span>
          </div>
        </div>

        {/* News Content */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            {newsArticles.map((article, index) => (
              <Card
                key={article.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:shadow-lg"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {article.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(article.publishedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl leading-tight">{article.title}</CardTitle>
                      <CardDescription className="mt-2">{article.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{article.source}</span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Read More
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
