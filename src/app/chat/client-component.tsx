'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'
import ChatTransition from '@/components/chat-transition'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { generateUUID } from '@/lib/chat-utils'

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
  const conversationId = searchParams.get('id')
  const initialQuery = searchParams.get('q')
  const [conversation, setConversation] = useState<Conversation | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchConversation = async () => {
      setIsLoading(true)
      
      try {
        if (!conversationId || !user) {
          if (initialQuery) {
            // Add a small delay to show the transition state
            await new Promise(resolve => setTimeout(resolve, 1500))
            setConversation({
              id: generateUUID(),
              title: initialQuery,
              messages: [{ content: initialQuery, sender: 'user' }]
            })
          }
          return
        }

        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching conversation:', error)
          return
        }

        if (data) {
          setConversation({
            id: data.id,
            title: data.title,
            messages: data.messages
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversation()
  }, [conversationId, initialQuery, user])

  if (isLoading) {
    return <ChatTransition query={initialQuery || undefined} />
  }

  return (
    <div className="min-h-screen">
      <ChatInterface 
        initialMessage={initialQuery || undefined}
        conversation={conversation}
        onUpdateConversation={(updatedConversation) => {
          setConversation(updatedConversation)
        }}
      />
    </div>
  )
} 