'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { initializeOrUpdateUserSettings } from '@/lib/api-utils'

type Message = {
  content: string;
  sender: 'user' | 'assistant';
}

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const initialQuery = searchParams?.get('q')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [conversation, setConversation] = useState<Conversation>({
    id: Date.now().toString(),
    title: initialQuery || 'New Chat',
    messages: initialQuery ? [{ content: initialQuery, sender: 'user' }] : []
  })

  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        await initializeOrUpdateUserSettings(user.id)

        const { data, error } = await supabase
          .from('user_settings')
          .select('openai_api_key')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching API key:', error)
          setApiKey(null)
        } else {
          setApiKey(data?.openai_api_key || null)
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
        setApiKey(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [user])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {conversation.title}
          </h1>
        </div>
        
        <ChatInterface
          initialMessage={initialQuery || ''}
          conversation={conversation}
          onUpdateConversation={setConversation}
          apiKey={apiKey}
        />
      </div>
    </div>
  )
} 