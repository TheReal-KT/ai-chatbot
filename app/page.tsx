import { ChatInterface } from "@/components/chat-interface"
import { redirect } from "next/navigation"
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient(); 
  const { 
    data: { user }, 
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  redirect("/chat"); 
  return (
    <main className="h-screen bg-background">
      <ChatInterface />
    </main>
  )
}
