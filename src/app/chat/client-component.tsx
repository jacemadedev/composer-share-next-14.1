'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
  const [conversation, setConversation] = useState<Conversation>({
    id: Date.now().toString(),
    title: initialQuery || 'New Chat',
    messages: initialQuery ? [{ content: initialQuery, sender: 'user' }] : []
  })

  useEffect(() => {
    if (user) {
      const fetchApiKey = async () => {
        const { data, error } = await supabase
          .from('user_settings')
          .select('openai_api_key')
          .eq('user_id', user.id)
          .single()

        if (!error && data?.openai_api_key) {
          setApiKey(data.openai_api_key)
        }
      }
      fetchApiKey()
    }
  }, [user])

  const handleSaveToHistory = async (updatedConversation: Conversation) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: updatedConversation.id,
          user_id: user.id,
          title: updatedConversation.title,
          messages: updatedConversation.messages,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving chat:', error)
    }
  }

  const handleApiKeySubmit = async (key: string) => {
    setApiKey(key)
    if (user) {
      try {
        // First check if user settings exist
        const { data: existingSettings, error: fetchError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (fetchError) {
          console.error('Error checking settings:', fetchError)
          return
        }

        if (existingSettings) {
          // Update existing settings
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({
              openai_api_key: key,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)

          if (updateError) {
            console.error('Error updating API key:', updateError)
          }
        } else {
          // Create new settings
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              openai_api_key: key,
              plan: 'free',
              is_premium: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error('Error inserting API key:', insertError)
          }
        }
      } catch (error) {
        console.error('Error in handleApiKeySubmit:', error)
      }
    }
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
          onApiKeySubmit={handleApiKeySubmit}
          onSaveToHistory={handleSaveToHistory}
        />
      </div>
    </div>
  )
} 