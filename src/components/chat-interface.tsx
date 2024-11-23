import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { SettingsModal } from './settings-modal'

type Message = {
  content: string;
  sender: 'user' | 'assistant';
}

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  initialMessage: string;
  conversation: Conversation;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  apiKey?: string | null;
}

export default function ChatInterface({ 
  initialMessage, 
  conversation, 
  onUpdateConversation,
  apiKey: externalApiKey
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(externalApiKey || null)
  const [showSettings, setShowSettings] = useState(false)
  const { user } = useAuth()

  const fetchApiKey = useCallback(async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching API key:', error)
        return null
      }

      const key = data?.openai_api_key || null
      if (key) {
        setApiKey(key)
        return key
      }
      return null
    } catch (error) {
      console.error('Error in fetchApiKey:', error)
      return null
    }
  }, [user])

  const handleSettingsClose = useCallback(() => {
    setShowSettings(false)
    fetchApiKey()
  }, [fetchApiKey])

  useEffect(() => {
    if (user) {
      fetchApiKey()
    }
  }, [user, fetchApiKey])

  useEffect(() => {
    if (externalApiKey) {
      setApiKey(externalApiKey)
    }
  }, [externalApiKey])

  const handleSend = useCallback(async (message: string = input) => {
    if (message.trim() && apiKey) {
      const newMessage: Message = { content: message, sender: 'user' }
      const updatedMessages = [...conversation.messages, newMessage]
      const updatedConversation = { ...conversation, messages: updatedMessages }
      onUpdateConversation(updatedConversation)

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for a Git repository management tool.' },
              ...updatedMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })),
            ],
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response from OpenAI')
        }

        const data = await response.json()
        const aiResponse: Message = { 
          content: data.choices[0].message.content, 
          sender: 'assistant' 
        }
        const finalMessages = [...updatedMessages, aiResponse]
        onUpdateConversation({ ...conversation, messages: finalMessages })
      } catch (error) {
        console.error('Error calling OpenAI API:', error)
      }

      setInput('')
    }
  }, [input, apiKey, conversation, onUpdateConversation])

  useEffect(() => {
    if (initialMessage && conversation.messages.length === 0) {
      handleSend(initialMessage)
    }
  }, [initialMessage, conversation.messages.length, handleSend])

  if (apiKey === null) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">OpenAI API Key Required</h2>
          <p className="text-gray-600 mb-6">
            Please configure your OpenAI API key in settings to use the chat feature.
          </p>
          <Button 
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure API Key
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-3 md:p-6">
          <div className="space-y-4 mb-4 h-[300px] md:h-[400px] overflow-y-auto">
            {conversation.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] p-2 md:p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm md:text-base">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="text-sm md:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
              onClick={() => handleSend()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={handleSettingsClose} 
      />
    </>
  )
}

