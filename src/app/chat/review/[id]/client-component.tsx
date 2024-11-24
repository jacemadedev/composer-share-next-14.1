'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from '@/components/loading-screen'

type Message = {
  content: string;
  sender: 'user' | 'assistant';
}

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  created_at?: string;
  updated_at?: string;
}

export default function ReviewPageClient() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConversation = async () => {
      if (!params.id || !user) return

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching conversation:', error)
        router.push('/chat')
        return
      }

      setConversation(data)
      setIsLoading(false)
    }

    fetchConversation()
  }, [params.id, user, router])

  if (isLoading) return <LoadingScreen />

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{conversation?.title}</h1>
      </div>
      
      <div className="space-y-4">
        {conversation?.messages.map((message: Message, index: number) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button 
          onClick={() => router.push(`/chat?id=${conversation?.id}`)}
          className="w-full"
        >
          Continue this conversation
        </Button>
      </div>
    </div>
  )
} 