'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Calendar, MessageCircle } from 'lucide-react'
import LoadingScreen from './loading-screen'
import { Button } from '@/components/ui/button'

interface ChatHistory {
  id: string
  title: string
  messages: Array<{ content: string; sender: 'user' | 'assistant' }>
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) throw error

        setChatHistory(data)
      } catch (error) {
        console.error('Error fetching chat history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChatHistory()
  }, [user])

  if (isLoading) return <LoadingScreen />

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Chat History</h1>
      {chatHistory.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No chat history found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatHistory.map((chat) => (
            <Card 
              key={chat.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {chat.title}
                </CardTitle>
                <CardDescription className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {chat.messages.length} messages
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {chat.messages[chat.messages.length - 1]?.content}
                  </p>
                </CardDescription>
              </CardHeader>
              <div className="p-4 pt-0">
                <Button 
                  className="w-full"
                  onClick={() => router.push(`/chat?id=${chat.id}`)}
                >
                  Resume Chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

