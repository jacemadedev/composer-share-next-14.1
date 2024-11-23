import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { ApiKeyInput } from './api-key-input'
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

interface ChatInterfaceProps {
  initialMessage: string;
  conversation: Conversation;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  apiKey: string | null;
  onApiKeySubmit: (apiKey: string) => void;
  onSaveToHistory?: (conversation: Conversation) => Promise<void>;
}

export default function ChatInterface({ initialMessage, conversation, onUpdateConversation, apiKey: providedApiKey, onApiKeySubmit, onSaveToHistory }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(providedApiKey)
  const [isKeyValid, setIsKeyValid] = useState(false)
  const { user } = useAuth()

  // Fetch saved API key on mount
  useEffect(() => {
    const fetchSavedApiKey = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('openai_api_key')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching API key:', error)
          return
        }

        if (data?.openai_api_key) {
          setApiKey(data.openai_api_key)
          validateApiKey(data.openai_api_key)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    if (!apiKey) {
      fetchSavedApiKey()
    }
  }, [user, apiKey])

  // Save API key to Supabase
  const handleApiKeySubmit = async (key: string) => {
    if (!user) return

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

        if (updateError) throw updateError
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

        if (insertError) throw insertError
      }

      setApiKey(key)
      onApiKeySubmit(key)
      validateApiKey(key)
    } catch (error) {
      console.error('Error saving API key:', error)
    }
  }

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

        if (onSaveToHistory) {
          await onSaveToHistory({
            ...conversation,
            messages: finalMessages
          });
        }
      } catch (error) {
        console.error('Error calling OpenAI API:', error)
        // Handle error (e.g., show error message to user)
      }

      setInput('')
    }
  }, [input, apiKey, conversation, onUpdateConversation, onSaveToHistory])

  useEffect(() => {
    if (initialMessage && conversation.messages.length === 0) {
      handleSend(initialMessage)
    }
  }, [initialMessage, conversation.messages.length, handleSend])

  useEffect(() => {
    if (apiKey) {
      validateApiKey(apiKey)
    }
  }, [apiKey])

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/engines', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      })
      setIsKeyValid(response.ok)
    } catch (error) {
      console.error('Error validating API key:', error)
      setIsKeyValid(false)
    }
  }

  if (!apiKey || !isKeyValid) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your OpenAI API Key</h2>
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} isKeyValid={isKeyValid} />
        </CardContent>
      </Card>
    )
  }

  return (
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
  )
}

