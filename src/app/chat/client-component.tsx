'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

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
  const [conversation, setConversation] = useState<Conversation | undefined>(undefined)
  const { user } = useAuth()

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId || !user) return

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
    }

    fetchConversation()
  }, [conversationId, user])

  return (
    <div className="min-h-screen">
      <ChatInterface 
        conversation={conversation}
        onUpdateConversation={(updatedConversation) => {
          setConversation(updatedConversation)
        }}
      />
    </div>
  )
} 