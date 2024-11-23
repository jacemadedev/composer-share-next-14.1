'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LoadingScreen from './loading-screen'

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Chat History</h1>
      
      {chatHistory.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat history yet</h3>
          <p className="text-gray-500 mb-4">Start a new chat to see your history here</p>
          <Button onClick={() => router.push('/')}>Start New Chat</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {chatHistory.map((chat) => (
            <Card 
              key={chat.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{chat.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {chat.messages[chat.messages.length - 1]?.content || 'No messages'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(chat.updated_at)}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

